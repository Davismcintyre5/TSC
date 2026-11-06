import Hero from "../components/sections/Hero.jsx";
import TheStadium from "../components/sections/TheStadium.jsx";
import Hospitality from "../components/sections/Hospitality.jsx";
import GettingThere from "../components/sections/GettingThere.jsx";
import Questions from "../components/sections/Questions.jsx";
import NotifyForm from "../components/sections/NotifyForm.jsx";

export default function Homepage() {
  return (
    <div>
      <Hero />
      <TheStadium />
      <Hospitality />
      <GettingThere />
      <Questions />
      <NotifyForm />
    </div>
  );
}