'use client';
import React, { useState, useRef, useCallback, useMemo } from 'react';

interface Note {
  id: string;
  x: number;
  y: number;
  pitch: string;
  duration: NoteDuration;
  measure: number;
  positionInMeasure: number;
}

type NoteDuration = 'whole' | 'half' | 'quarter' | 'eighth' | 'sixteenth';

const STAFF_LINES = 5;
const STAFF_LINE_HEIGHT = 20;
const STAFF_START_Y = 100;
const NOTE_RADIUS = 8;
const MEASURE_WIDTH = 200;
const MEASURES_PER_LINE = 4;
const LINE_HEIGHT = 150;
const STAFF_START_X = 100;

const DURATION_VALUES = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  sixteenth: 0.25,
};

const NOTE_POSITIONS: { [key: string]: number } = {
  F5: -40,
  E5: -30,
  D5: -20,
  C5: -10,
  B4: 0,
  A4: 10,
  G4: 20,
  F4: 30,
  E4: 40,
  D4: 50,
  C4: 60,
  B3: 70,
  A3: 80,
  G3: 90,
  F3: 100,
};

const NOTE_DURATION_SYMBOLS = {
  whole: '𝅝',
  half: '𝅗𝅥',
  quarter: '♩',
  eighth: '♪',
  sixteenth: '𝅘𝅥𝅯',
};

export default function NotesEditor() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<NoteDuration>('quarter');
  const [totalMeasures, setTotalMeasures] = useState<number>(4);
  const [hoverPosition, setHoverPosition] = useState<{
    x: number;
    y: number;
    measure: number;
    pitch: string;
    canPlace: boolean;
    suggestedPosition?: number;
    warning?: string;
  } | null>(null);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [showHelpers, setShowHelpers] = useState<boolean>(true);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getStaffLineForMeasure = useCallback((measureNumber: number): number => {
    return Math.floor(measureNumber / MEASURES_PER_LINE);
  }, []);

  const getMeasurePositionInLine = useCallback((measureNumber: number): number => {
    return measureNumber % MEASURES_PER_LINE;
  }, []);

  const getMeasureCoordinates = useCallback(
    (measureNumber: number): { x: number; y: number } => {
      const line = getStaffLineForMeasure(measureNumber);
      const positionInLine = getMeasurePositionInLine(measureNumber);
      const x = STAFF_START_X + positionInLine * MEASURE_WIDTH;
      const y = STAFF_START_Y + line * LINE_HEIGHT;
      return { x, y };
    },
    [getStaffLineForMeasure, getMeasurePositionInLine]
  );

  const getPitchFromY = (y: number, staffLineNumber: number = 0): string => {
    const staffBaseY = STAFF_START_Y + staffLineNumber * LINE_HEIGHT;
    const relativeY = y - staffBaseY;
    const snappedY = Math.round(relativeY / 10) * 10;

    let closestPitch = 'C4';
    let minDistance = Infinity;

    Object.entries(NOTE_POSITIONS).forEach(([pitch, pitchY]) => {
      const distance = Math.abs(pitchY - snappedY);
      if (distance < minDistance) {
        minDistance = distance;
        closestPitch = pitch;
      }
    });

    return closestPitch;
  };

  const getMeasureFromClick = useCallback(
    (x: number, y: number): number => {
      const line = Math.max(0, Math.floor((y - STAFF_START_Y + LINE_HEIGHT / 2) / LINE_HEIGHT));
      const relativeX = x - STAFF_START_X;
      if (relativeX < 0) return line * MEASURES_PER_LINE;

      const positionInLine = Math.min(MEASURES_PER_LINE - 1, Math.floor(relativeX / MEASURE_WIDTH));
      const measureNumber = line * MEASURES_PER_LINE + positionInLine;
      return Math.min(measureNumber, totalMeasures - 1);
    },
    [totalMeasures]
  );

  const calculateBestPosition = useCallback(
    (
      measure: number,
      targetPosition: number,
      duration: NoteDuration
    ): { position: number; canPlace: boolean; warning?: string } => {
      const notesInMeasure = notes.filter((note) => note.measure === measure);
      const newNoteDurationValue = DURATION_VALUES[duration];

      // Check total duration
      let usedDuration = 0;
      for (const note of notesInMeasure) {
        usedDuration += DURATION_VALUES[note.duration];
      }

      if (usedDuration + newNoteDurationValue > 4) {
        return { position: 0, canPlace: false, warning: 'Measure is full' };
      }

      // Sort existing notes by position
      const sortedNotes = notesInMeasure.sort((a, b) => a.positionInMeasure - b.positionInMeasure);

      // Try to place at target position first
      let bestPosition = snapToGrid ? Math.round(targetPosition * 8) / 8 : targetPosition;
      bestPosition = Math.max(0, Math.min(4 - newNoteDurationValue, bestPosition));

      // Check for conflicts
      const hasConflict = (pos: number): boolean => {
        const newNoteEnd = pos + newNoteDurationValue;
        return sortedNotes.some((note) => {
          const noteStart = note.positionInMeasure;
          const noteEnd = noteStart + DURATION_VALUES[note.duration];
          return (
            (pos >= noteStart && pos < noteEnd) ||
            (newNoteEnd > noteStart && newNoteEnd <= noteEnd) ||
            (pos <= noteStart && newNoteEnd >= noteEnd)
          );
        });
      };

      if (!hasConflict(bestPosition)) {
        return { position: bestPosition, canPlace: true };
      }

      // Find the best available slot
      const slots: { start: number; end: number }[] = [];

      // Add slot before first note
      if (sortedNotes.length > 0 && sortedNotes[0].positionInMeasure > 0) {
        slots.push({ start: 0, end: sortedNotes[0].positionInMeasure });
      }

      // Add slots between notes
      for (let i = 0; i < sortedNotes.length - 1; i++) {
        const currentEnd =
          sortedNotes[i].positionInMeasure + DURATION_VALUES[sortedNotes[i].duration];
        const nextStart = sortedNotes[i + 1].positionInMeasure;
        if (currentEnd < nextStart) {
          slots.push({ start: currentEnd, end: nextStart });
        }
      }

      // Add slot after last note
      if (sortedNotes.length > 0) {
        const lastEnd =
          sortedNotes[sortedNotes.length - 1].positionInMeasure +
          DURATION_VALUES[sortedNotes[sortedNotes.length - 1].duration];
        if (lastEnd < 4) {
          slots.push({ start: lastEnd, end: 4 });
        }
      }

      // If no notes, entire measure is available
      if (sortedNotes.length === 0) {
        slots.push({ start: 0, end: 4 });
      }

      // Find best slot that can fit the note
      for (const slot of slots) {
        if (slot.end - slot.start >= newNoteDurationValue) {
          // Try to place as close to target as possible within this slot
          let position = Math.max(
            slot.start,
            Math.min(slot.end - newNoteDurationValue, bestPosition)
          );
          if (snapToGrid) {
            position = Math.round(position * 8) / 8;
            // Ensure snapped position still fits in slot
            if (position < slot.start) position = Math.ceil(slot.start * 8) / 8;
            if (position + newNoteDurationValue > slot.end)
              position = Math.floor((slot.end - newNoteDurationValue) * 8) / 8;
          }
          return { position, canPlace: true };
        }
      }

      return { position: 0, canPlace: false, warning: 'No space available' };
    },
    [notes, snapToGrid]
  );

  const addNote = useCallback(
    (x: number, y: number) => {
      const staffLine = Math.max(
        0,
        Math.floor((y - STAFF_START_Y + LINE_HEIGHT / 2) / LINE_HEIGHT)
      );
      const staffBaseY = STAFF_START_Y + staffLine * LINE_HEIGHT;
      const relativeYInStaff = y - staffBaseY;
      const snappedYInStaff = Math.round(relativeYInStaff / 10) * 10;
      const snappedY = staffBaseY + snappedYInStaff;

      const pitch = getPitchFromY(snappedY, staffLine);
      const measure = getMeasureFromClick(x, y);

      // Auto-expand measures if needed
      if (measure >= totalMeasures - 1) {
        setTotalMeasures((prev) => prev + MEASURES_PER_LINE);
      }

      const measureCoords = getMeasureCoordinates(measure);
      const relativeXInMeasure = x - measureCoords.x - 10;
      const measureWidth = MEASURE_WIDTH - 20;
      const targetTimePosition = Math.max(0, Math.min(4, (relativeXInMeasure / measureWidth) * 4));

      const result = calculateBestPosition(measure, targetTimePosition, selectedDuration);

      if (!result.canPlace) {
        // Show visual feedback for failed placement
        setHoverPosition({
          x: measureCoords.x + 10 + (targetTimePosition / 4) * measureWidth,
          y: snappedY,
          measure,
          pitch,
          canPlace: false,
          warning: result.warning,
        });
        return false;
      }

      const newNote: Note = {
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: measureCoords.x + 10 + (result.position / 4) * measureWidth,
        y: snappedY,
        pitch,
        duration: selectedDuration,
        measure,
        positionInMeasure: result.position,
      };

      setNotes((prev) => [...prev, newNote]);
      setSelectedNote(newNote.id);
      return true;
    },
    [
      selectedDuration,
      totalMeasures,
      getMeasureFromClick,
      getMeasureCoordinates,
      calculateBestPosition,
    ]
  );

  const handleStaffClick = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      addNote(x, y);
    },
    [addNote]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const staffLine = Math.max(
        0,
        Math.floor((y - STAFF_START_Y + LINE_HEIGHT / 2) / LINE_HEIGHT)
      );
      const staffBaseY = STAFF_START_Y + staffLine * LINE_HEIGHT;
      const relativeYInStaff = y - staffBaseY;
      const snappedYInStaff = Math.round(relativeYInStaff / 10) * 10;
      const snappedY = staffBaseY + snappedYInStaff;

      const pitch = getPitchFromY(snappedY, staffLine);
      const measure = getMeasureFromClick(x, y);

      const measureCoords = getMeasureCoordinates(measure);
      const relativeXInMeasure = x - measureCoords.x - 10;
      const measureWidth = MEASURE_WIDTH - 20;
      const timePosition = Math.max(0, Math.min(4, (relativeXInMeasure / measureWidth) * 4));

      const result = calculateBestPosition(measure, timePosition, selectedDuration);
      const snappedX = measureCoords.x + 10 + (result.position / 4) * measureWidth;

      setHoverPosition({
        x: snappedX,
        y: snappedY,
        measure,
        pitch,
        canPlace: result.canPlace,
        suggestedPosition: result.position,
        warning: result.warning,
      });
    },
    [getMeasureFromClick, getMeasureCoordinates, selectedDuration, calculateBestPosition]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverPosition(null);
  }, []);

  const removeNote = useCallback(
    (noteId: string) => {
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      if (selectedNote === noteId) {
        setSelectedNote(null);
      }
    },
    [selectedNote]
  );

  const clearAll = useCallback(() => {
    setNotes([]);
    setTotalMeasures(4);
    setSelectedNote(null);
  }, []);

  const totalStaffLines = useMemo(
    () => Math.ceil(totalMeasures / MEASURES_PER_LINE),
    [totalMeasures]
  );

  const svgHeight = useMemo(
    () => Math.max(400, STAFF_START_Y + (totalStaffLines - 1) * LINE_HEIGHT + 150),
    [totalStaffLines]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Enhanced Header */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
                <span className="text-2xl font-bold text-white">♪</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Smart Music Composer</h1>
                <p className="text-sm text-gray-600">
                  Intelligent note placement with collision detection
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <label
                  htmlFor="duration-select"
                  className="whitespace-nowrap text-sm font-medium text-gray-700"
                >
                  Note Duration:
                </label>
                <select
                  id="duration-select"
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value as NoteDuration)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="whole">Whole {NOTE_DURATION_SYMBOLS.whole}</option>
                  <option value="half">Half {NOTE_DURATION_SYMBOLS.half}</option>
                  <option value="quarter">Quarter {NOTE_DURATION_SYMBOLS.quarter}</option>
                  <option value="eighth">Eighth {NOTE_DURATION_SYMBOLS.eighth}</option>
                  <option value="sixteenth">Sixteenth {NOTE_DURATION_SYMBOLS.sixteenth}</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={snapToGrid}
                    onChange={(e) => setSnapToGrid(e.target.checked)}
                    className="rounded"
                  />
                  Snap to Grid
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showHelpers}
                    onChange={(e) => setShowHelpers(e.target.checked)}
                    className="rounded"
                  />
                  Show Helpers
                </label>
              </div>

              <button
                onClick={clearAll}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-all duration-200 hover:bg-red-700 hover:shadow-lg"
              >
                <span className="text-sm">🗑️</span>
                Clear All
              </button>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="text-sm font-medium text-blue-900">Measures: {totalMeasures}</div>
                <div className="text-xs text-blue-700">Notes: {notes.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Staff Container */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/90 shadow-xl backdrop-blur-sm">
          {/* Toolbar */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-sm font-medium text-gray-700">Staff View</div>
                <div className="text-xs text-gray-500">Time Signature: 4/4</div>
                {hoverPosition && (
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${hoverPosition.canPlace ? 'bg-green-500' : 'bg-red-500'}`}
                    ></span>
                    <span className={hoverPosition.canPlace ? 'text-green-700' : 'text-red-700'}>
                      {hoverPosition.canPlace ? 'Ready to place' : hoverPosition.warning}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {snapToGrid ? 'Smart grid snapping enabled' : 'Free positioning'}
              </div>
            </div>
          </div>

          {/* Staff SVG */}
          <div className="bg-gradient-to-b from-gray-50/50 to-white p-6">
            <svg
              ref={svgRef}
              width="100%"
              height={svgHeight}
              onClick={handleStaffClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="cursor-crosshair rounded-lg border border-gray-200 bg-white shadow-inner transition-all duration-300 hover:shadow-md"
              style={{ minHeight: '400px' }}
            >
              {/* Grid lines for visual reference */}
              {showHelpers &&
                Array.from({ length: totalStaffLines }, (_, staffLineIndex) => {
                  const staffY = STAFF_START_Y + staffLineIndex * LINE_HEIGHT;
                  return (
                    <g key={`grid-${staffLineIndex}`}>
                      {Array.from({ length: MEASURES_PER_LINE }, (_, measureIndex) => {
                        const measureNumber = staffLineIndex * MEASURES_PER_LINE + measureIndex;
                        if (measureNumber >= totalMeasures) return null;
                        const measureX = STAFF_START_X + measureIndex * MEASURE_WIDTH;

                        return Array.from({ length: 8 }, (_, i) => (
                          <line
                            key={`grid-${measureNumber}-${i}`}
                            x1={measureX + 10 + (i * (MEASURE_WIDTH - 20)) / 8}
                            y1={staffY - 20}
                            x2={measureX + 10 + (i * (MEASURE_WIDTH - 20)) / 8}
                            y2={staffY + (STAFF_LINES - 1) * STAFF_LINE_HEIGHT + 20}
                            stroke="rgba(59, 130, 246, 0.1)"
                            strokeWidth="1"
                            strokeDasharray={i % 2 === 0 ? '2,2' : '1,3'}
                          />
                        ));
                      })}
                    </g>
                  );
                })}

              {/* Render staff lines */}
              {Array.from({ length: totalStaffLines }, (_, staffLineIndex) => {
                const staffY = STAFF_START_Y + staffLineIndex * LINE_HEIGHT;

                return (
                  <g key={`staff-line-${staffLineIndex}`}>
                    {/* Treble Clef */}
                    <text
                      x="20"
                      y={staffY + 60}
                      fontSize="60"
                      className="select-none fill-gray-800"
                      style={{ fontFamily: 'serif' }}
                    >
                      𝄞
                    </text>

                    {/* Time signature */}
                    <text
                      x="70"
                      y={staffY + 15}
                      fontSize="20"
                      className="select-none fill-gray-800"
                      style={{ fontFamily: 'serif' }}
                    >
                      4
                    </text>
                    <text
                      x="70"
                      y={staffY + 55}
                      fontSize="20"
                      className="select-none fill-gray-800"
                      style={{ fontFamily: 'serif' }}
                    >
                      4
                    </text>

                    {/* Staff lines */}
                    {Array.from({ length: STAFF_LINES }, (_, i) => (
                      <line
                        key={`staff-${staffLineIndex}-line-${i}`}
                        x1="60"
                        y1={staffY + i * STAFF_LINE_HEIGHT}
                        x2={STAFF_START_X + MEASURES_PER_LINE * MEASURE_WIDTH}
                        y2={staffY + i * STAFF_LINE_HEIGHT}
                        stroke="#374151"
                        strokeWidth="1.5"
                      />
                    ))}

                    {/* Measure lines */}
                    {Array.from({ length: MEASURES_PER_LINE + 1 }, (_, measureIndex) => {
                      const measureNumber = staffLineIndex * MEASURES_PER_LINE + measureIndex;
                      const isLastMeasureOnLine = measureIndex === MEASURES_PER_LINE;
                      const isFirstMeasure = measureIndex === 0;

                      if (measureNumber > totalMeasures && !isLastMeasureOnLine) return null;

                      return (
                        <line
                          key={`measure-line-${staffLineIndex}-${measureIndex}`}
                          x1={STAFF_START_X + measureIndex * MEASURE_WIDTH}
                          y1={staffY}
                          x2={STAFF_START_X + measureIndex * MEASURE_WIDTH}
                          y2={staffY + (STAFF_LINES - 1) * STAFF_LINE_HEIGHT}
                          stroke="#374151"
                          strokeWidth={
                            isFirstMeasure ||
                            (isLastMeasureOnLine && measureNumber <= totalMeasures)
                              ? '3'
                              : '1.5'
                          }
                        />
                      );
                    })}

                    {/* Measure numbers */}
                    {Array.from({ length: MEASURES_PER_LINE }, (_, measureIndex) => {
                      const measureNumber = staffLineIndex * MEASURES_PER_LINE + measureIndex;
                      if (measureNumber >= totalMeasures) return null;

                      return (
                        <text
                          key={`measure-number-${measureNumber}`}
                          x={STAFF_START_X + measureIndex * MEASURE_WIDTH + MEASURE_WIDTH / 2}
                          y={staffY - 15}
                          textAnchor="middle"
                          fontSize="14"
                          className="select-none fill-gray-600 font-medium"
                        >
                          {measureNumber + 1}
                        </text>
                      );
                    })}
                  </g>
                );
              })}

              {/* Enhanced hover preview */}
              {hoverPosition && (
                <g>
                  <ellipse
                    cx={hoverPosition.x}
                    cy={hoverPosition.y}
                    rx={NOTE_RADIUS + 2}
                    ry={(NOTE_RADIUS + 2) * 0.8}
                    fill={
                      hoverPosition.canPlace ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'
                    }
                    stroke={
                      hoverPosition.canPlace ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
                    }
                    strokeWidth="2"
                    className="pointer-events-none"
                  />

                  {selectedDuration !== 'whole' && (
                    <line
                      x1={hoverPosition.x + NOTE_RADIUS}
                      y1={hoverPosition.y}
                      x2={hoverPosition.x + NOTE_RADIUS}
                      y2={hoverPosition.y - 60}
                      stroke={
                        hoverPosition.canPlace ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
                      }
                      strokeWidth="2"
                      className="pointer-events-none"
                    />
                  )}

                  <text
                    x={hoverPosition.x}
                    y={hoverPosition.y - 90}
                    textAnchor="middle"
                    fontSize="12"
                    className={`pointer-events-none select-none font-semibold ${
                      hoverPosition.canPlace ? 'fill-green-600' : 'fill-red-600'
                    }`}
                  >
                    {hoverPosition.pitch} ({selectedDuration})
                  </text>

                  <text
                    x={hoverPosition.x}
                    y={hoverPosition.y + 100}
                    textAnchor="middle"
                    fontSize="10"
                    className="pointer-events-none select-none fill-gray-500"
                  >
                    Measure {hoverPosition.measure + 1}
                    {hoverPosition.warning && ` - ${hoverPosition.warning}`}
                  </text>
                </g>
              )}

              {/* Enhanced Notes */}
              {notes.map((note) => (
                <g key={note.id}>
                  {note.duration === 'whole' ? (
                    <ellipse
                      cx={note.x}
                      cy={note.y}
                      rx={NOTE_RADIUS + 2}
                      ry={(NOTE_RADIUS + 2) * 0.8}
                      fill="none"
                      stroke={selectedNote === note.id ? '#3B82F6' : '#1F2937'}
                      strokeWidth={selectedNote === note.id ? '3' : '2'}
                      className="cursor-pointer transition-all duration-200 hover:stroke-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedNote === note.id) {
                          removeNote(note.id);
                        } else {
                          setSelectedNote(note.id);
                        }
                      }}
                    />
                  ) : note.duration === 'half' ? (
                    <ellipse
                      cx={note.x}
                      cy={note.y}
                      rx={NOTE_RADIUS}
                      ry={NOTE_RADIUS * 0.8}
                      fill="none"
                      stroke={selectedNote === note.id ? '#3B82F6' : '#1F2937'}
                      strokeWidth={selectedNote === note.id ? '3' : '2'}
                      className="cursor-pointer transition-all duration-200 hover:stroke-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedNote === note.id) {
                          removeNote(note.id);
                        } else {
                          setSelectedNote(note.id);
                        }
                      }}
                    />
                  ) : (
                    <ellipse
                      cx={note.x}
                      cy={note.y}
                      rx={NOTE_RADIUS}
                      ry={NOTE_RADIUS * 0.8}
                      fill={selectedNote === note.id ? '#3B82F6' : '#1F2937'}
                      className="cursor-pointer transition-all duration-200 hover:fill-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedNote === note.id) {
                          removeNote(note.id);
                        } else {
                          setSelectedNote(note.id);
                        }
                      }}
                    />
                  )}

                  {note.duration !== 'whole' && (
                    <line
                      x1={note.x + NOTE_RADIUS}
                      y1={note.y}
                      x2={note.x + NOTE_RADIUS}
                      y2={note.y - 60}
                      stroke={selectedNote === note.id ? '#3B82F6' : '#1F2937'}
                      strokeWidth={selectedNote === note.id ? '3' : '2'}
                      className="pointer-events-none"
                    />
                  )}

                  {note.duration === 'eighth' && (
                    <path
                      d={`M${note.x + NOTE_RADIUS} ${note.y - 60} 
                          C${note.x + NOTE_RADIUS + 15} ${note.y - 50} 
                          ${note.x + NOTE_RADIUS + 15} ${note.y - 40} 
                          ${note.x + NOTE_RADIUS} ${note.y - 30}`}
                      fill={selectedNote === note.id ? '#3B82F6' : '#1F2937'}
                      className="pointer-events-none"
                    />
                  )}

                  {note.duration === 'sixteenth' && (
                    <>
                      <path
                        d={`M${note.x + NOTE_RADIUS} ${note.y - 60} 
                            C${note.x + NOTE_RADIUS + 15} ${note.y - 50} 
                            ${note.x + NOTE_RADIUS + 15} ${note.y - 40} 
                            ${note.x + NOTE_RADIUS} ${note.y - 30}`}
                        fill={selectedNote === note.id ? '#3B82F6' : '#1F2937'}
                        className="pointer-events-none"
                      />
                      <path
                        d={`M${note.x + NOTE_RADIUS} ${note.y - 50} 
                            C${note.x + NOTE_RADIUS + 15} ${note.y - 40} 
                            ${note.x + NOTE_RADIUS + 15} ${note.y - 30} 
                            ${note.x + NOTE_RADIUS} ${note.y - 20}`}
                        fill={selectedNote === note.id ? '#3B82F6' : '#1F2937'}
                        className="pointer-events-none"
                      />
                    </>
                  )}

                  {showHelpers && (
                    <text
                      x={note.x}
                      y={note.y - 75}
                      textAnchor="middle"
                      fontSize="10"
                      className="pointer-events-none select-none fill-gray-600 font-medium"
                    >
                      {note.pitch}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Enhanced Help Panel */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800">
            <span className="text-blue-600">💡</span>
            Smart Composer Guide
          </h3>
          <div className="grid grid-cols-1 gap-6 text-sm text-gray-600 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Note Placement</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-green-600">•</span>
                  <span>
                    <strong>Click</strong> anywhere on the staff to add notes
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-green-600">•</span>
                  <span>Smart positioning automatically finds the best spot</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-green-600">•</span>
                  <span>Green preview = valid placement</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Smart Features</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">•</span>
                  <span>Automatic collision detection</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">•</span>
                  <span>Grid snapping for perfect timing</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">•</span>
                  <span>Real-time measure capacity checking</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Interaction</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-purple-600">•</span>
                  <span>Click a note to select it</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-purple-600">•</span>
                  <span>Click selected note again to delete</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-purple-600">•</span>
                  <span>Staff auto-expands as you compose</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
