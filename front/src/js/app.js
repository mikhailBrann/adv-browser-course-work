import Chaos from "../components/Chaos/classes/Chaos.js";
import "../components/Chaos/css/style.css";


document.addEventListener("DOMContentLoaded", () => {
  const parentNode = document.querySelector('.Frontend');
  const chat = new Chaos(parentNode);
});
