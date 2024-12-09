"use client";
function StartupForm() {
  return (
    <form
      action={() => {}}
      className="max-w-2xl mx-auto my-10 space-y-8 px-6 text"
    >
      <label htmlFor="title" className="form-label">
        Name Your Idea
      </label>
      <input
        type="text"
        id="title"
        name="title"
        className="form-input"
        required
        placeholder="Think about some unforgettable name to make the failure memorable"
      />
    </form>
  );
}

export default StartupForm;
