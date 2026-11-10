import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Ticker from './components/Ticker'
import HowItWorks from './components/HowItWorks'
import Pricing from './components/Pricing'
import FAQ from './components/FAQ'
import Waitlist from './components/Waitlist'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Ticker />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <Waitlist />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
