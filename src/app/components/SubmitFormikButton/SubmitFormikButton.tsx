function SubmitFormikButton({ text = "confirm", disabled = true }) {
  return (
    <button
      type="submit"
      onClick={(e) => disabled && e.preventDefault()}
      className={`border-2 m-3 p-3 rounded
        bg-orange-300 font-bold text-2xl mt-7
        hover:bg-orange-400 hover:text-black
        w-52 flex self-center justify-center
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {text}
    </button>
  );
}


export default SubmitFormikButton
