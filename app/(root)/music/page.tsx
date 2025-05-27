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
  } | null>(null);
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

      if (measure >= totalMeasures - 1) {
        setTotalMeasures((prev) => prev + MEASURES_PER_LINE);
      }

      const notesInMeasure = notes.filter((note) => note.measure === measure);
      let usedDuration = 0;
      for (const note of notesInMeasure) {
        usedDuration += DURATION_VALUES[note.duration];
      }

      const newNoteDurationValue = DURATION_VALUES[selectedDuration];
      if (usedDuration + newNoteDurationValue > 4) {
        alert(
          `Cannot add ${selectedDuration} note to measure ${
            measure + 1
          }. Not enough space remaining.`
        );
        return;
      }

      const measureCoords = getMeasureCoordinates(measure);
      const relativeXInMeasure = x - measureCoords.x - 10;
      const measureWidth = MEASURE_WIDTH - 20;
      const targetTimePosition = Math.max(0, Math.min(4, (relativeXInMeasure / measureWidth) * 4));

      const sortedNotes = notesInMeasure.sort((a, b) => a.positionInMeasure - b.positionInMeasure);
      let insertPosition = 0;

      for (let i = 0; i < sortedNotes.length; i++) {
        const currentNote = sortedNotes[i];
        const nextNote = sortedNotes[i + 1];

        const currentEnd = currentNote.positionInMeasure + DURATION_VALUES[currentNote.duration];
        const nextStart = nextNote ? nextNote.positionInMeasure : 4;

        if (
          insertPosition + newNoteDurationValue <= currentNote.positionInMeasure &&
          targetTimePosition <= currentNote.positionInMeasure
        ) {
          break;
        }

        if (currentEnd + newNoteDurationValue <= nextStart && targetTimePosition >= currentEnd) {
          insertPosition = currentEnd;
          if (nextNote && targetTimePosition + newNoteDurationValue <= nextNote.positionInMeasure) {
            insertPosition = Math.min(targetTimePosition, nextStart - newNoteDurationValue);
          }
          break;
        }

        insertPosition = currentEnd;
      }

      insertPosition = Math.min(insertPosition, 4 - newNoteDurationValue);

      const newNote: Note = {
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: measureCoords.x + 10 + (insertPosition / 4) * measureWidth,
        y: snappedY,
        pitch,
        duration: selectedDuration,
        measure,
        positionInMeasure: insertPosition,
      };

      setNotes((prev) => [...prev, newNote]);
    },
    [selectedDuration, notes, totalMeasures, getMeasureFromClick, getMeasureCoordinates]
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

      const snappedTimePosition = Math.round(timePosition * 8) / 8;
      const snappedX = measureCoords.x + 10 + (snappedTimePosition / 4) * measureWidth;

      setHoverPosition({ x: snappedX, y: snappedY, measure, pitch });
    },
    [getMeasureFromClick, getMeasureCoordinates]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverPosition(null);
  }, []);

  const removeNote = useCallback((noteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
  }, []);

  const clearAll = useCallback(() => {
    setNotes([]);
    setTotalMeasures(4);
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
    <div className="min-h-screen bg-gray-500 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <span className="text-xl font-bold text-white">♪</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Music Notes Editor</h1>
                  <p className="text-sm text-gray-500">Professional music composition tool</p>
                </div>
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

              <button
                onClick={clearAll}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-red-700"
              >
                <span className="text-sm">🗑️</span>
                Clear All
              </button>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="text-sm font-medium text-blue-900">
                  Total Measures: {totalMeasures}
                </div>
                <div className="text-xs text-blue-700">Notes: {notes.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Staff Container */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium text-gray-700">Staff View</div>
                <div className="text-xs text-gray-500">Time Signature: 4/4</div>
              </div>
              <div className="text-xs text-gray-500">
                Hover over the staff to preview note placement
              </div>
            </div>
          </div>

          {/* Staff SVG */}
          <div className="bg-gradient-to-b from-gray-50 to-white p-6">
            <svg
              ref={svgRef}
              width="100%"
              height={svgHeight}
              onClick={handleStaffClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="cursor-crosshair rounded-lg border border-gray-200 bg-white shadow-inner"
              style={{ minHeight: '400px' }}
            >
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
                      className="select-none fill-black"
                      style={{ fontFamily: 'serif' }}
                    >
                      𝄞
                    </text>

                    {/* Time signature */}
                    <text
                      x="70"
                      y={staffY + 15}
                      fontSize="20"
                      className="select-none fill-black"
                      style={{ fontFamily: 'serif' }}
                    >
                      4
                    </text>
                    <text
                      x="70"
                      y={staffY + 55}
                      fontSize="20"
                      className="select-none fill-black"
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
                        stroke="black"
                        strokeWidth="1"
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
                          stroke="black"
                          strokeWidth={
                            isFirstMeasure ||
                            (isLastMeasureOnLine && measureNumber <= totalMeasures)
                              ? '3'
                              : '1'
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
                          y={staffY - 10}
                          textAnchor="middle"
                          fontSize="14"
                          className="select-none fill-gray-500"
                        >
                          {measureNumber + 1}
                        </text>
                      );
                    })}
                  </g>
                );
              })}

              {/* Hover preview */}
              {hoverPosition && (
                <g>
                  <ellipse
                    cx={hoverPosition.x}
                    cy={hoverPosition.y}
                    rx={NOTE_RADIUS}
                    ry={NOTE_RADIUS * 0.8}
                    fill="rgba(59, 130, 246, 0.5)"
                    stroke="rgba(59, 130, 246, 0.8)"
                    strokeWidth="2"
                    className="pointer-events-none"
                  />

                  {selectedDuration !== 'whole' && (
                    <line
                      x1={hoverPosition.x + NOTE_RADIUS}
                      y1={hoverPosition.y}
                      x2={hoverPosition.x + NOTE_RADIUS}
                      y2={hoverPosition.y - 60}
                      stroke="rgba(59, 130, 246, 0.8)"
                      strokeWidth="2"
                      className="pointer-events-none"
                    />
                  )}

                  <text
                    x={hoverPosition.x}
                    y={hoverPosition.y - 80}
                    textAnchor="middle"
                    fontSize="12"
                    className="pointer-events-none select-none fill-blue-600 font-semibold"
                  >
                    {hoverPosition.pitch} ({selectedDuration})
                  </text>

                  <text
                    x={hoverPosition.x}
                    y={hoverPosition.y + 90}
                    textAnchor="middle"
                    fontSize="10"
                    className="pointer-events-none select-none fill-gray-500"
                  >
                    Measure {hoverPosition.measure + 1}
                  </text>
                </g>
              )}

              {/* Notes */}
              {notes.map((note) => (
                <g key={note.id}>
                  {note.duration === 'whole' ? (
                    <ellipse
                      cx={note.x}
                      cy={note.y}
                      rx={NOTE_RADIUS + 2}
                      ry={NOTE_RADIUS * 0.8}
                      fill="none"
                      stroke="black"
                      strokeWidth="2"
                      className="cursor-pointer transition-colors duration-200 hover:stroke-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNote(note.id);
                      }}
                    />
                  ) : note.duration === 'half' ? (
                    <ellipse
                      cx={note.x}
                      cy={note.y}
                      rx={NOTE_RADIUS}
                      ry={NOTE_RADIUS * 0.8}
                      fill="none"
                      stroke="black"
                      strokeWidth="2"
                      className="cursor-pointer transition-colors duration-200 hover:stroke-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNote(note.id);
                      }}
                    />
                  ) : (
                    <ellipse
                      cx={note.x}
                      cy={note.y}
                      rx={NOTE_RADIUS}
                      ry={NOTE_RADIUS * 0.8}
                      fill="black"
                      className="cursor-pointer transition-colors duration-200 hover:fill-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNote(note.id);
                      }}
                    />
                  )}

                  {note.duration !== 'whole' && (
                    <line
                      x1={note.x + NOTE_RADIUS}
                      y1={note.y}
                      x2={note.x + NOTE_RADIUS}
                      y2={note.y - 60}
                      stroke="black"
                      strokeWidth="2"
                      className="pointer-events-none"
                    />
                  )}

                  {note.duration === 'eighth' && (
                    <path
                      d={`M${note.x + NOTE_RADIUS} ${note.y - 60} 
                          C${note.x + NOTE_RADIUS + 15} ${note.y - 50} 
                          ${note.x + NOTE_RADIUS + 15} ${note.y - 40} 
                          ${note.x + NOTE_RADIUS} ${note.y - 30}`}
                      fill="black"
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
                        fill="black"
                        className="pointer-events-none"
                      />
                      <path
                        d={`M${note.x + NOTE_RADIUS} ${note.y - 50} 
                            C${note.x + NOTE_RADIUS + 15} ${note.y - 40} 
                            ${note.x + NOTE_RADIUS + 15} ${note.y - 30} 
                            ${note.x + NOTE_RADIUS} ${note.y - 20}`}
                        fill="black"
                        className="pointer-events-none"
                      />
                    </>
                  )}

                  <text
                    x={note.x}
                    y={note.y - 70}
                    textAnchor="middle"
                    fontSize="12"
                    className="pointer-events-none select-none fill-gray-600"
                  >
                    {note.pitch} ({note.duration})
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Help Panel */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
            <span className="text-blue-600">💡</span>
            Quick Guide
          </h3>
          <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="font-bold text-green-600">•</span>
                <span>
                  <strong>Click</strong> on the staff to add notes
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-green-600">•</span>
                <span>Notes automatically snap to staff lines</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-green-600">•</span>
                <span>Use the dropdown to select note duration</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="font-bold text-blue-600">•</span>
                <span>Each measure holds up to 4 quarter notes (4/4 time)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-blue-600">•</span>
                <span>Click on any note to remove it</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-blue-600">•</span>
                <span>Staff expands automatically as needed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
