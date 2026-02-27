function TapButton({ tap }) {

  const handleTap = (e) => {
    e.preventDefault();
    tap();
  };

  return (
    <button
      className="tap-button"
      onClick={handleTap}
      onTouchStart={handleTap}
    >
      ⚡ ТАПАЙ
    </button>
  );
}

export default TapButton;
