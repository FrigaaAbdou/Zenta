import { Hero } from "./components/Hero.jsx";
import { Features } from "./components/Features.jsx";
import { ChatPreview } from "./components/ChatPreview.jsx";
import { HowItWorks } from "./components/HowItWorks.jsx";
import { FAQ } from "./components/FAQ.jsx";
import { CTA } from "./components/CTA.jsx";
import { Footer } from "./components/Footer.jsx";

function App() {
  return (
    <div className="bg-white">
      <Hero />
      <Features />
      <ChatPreview />
      <HowItWorks />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

export default App;
