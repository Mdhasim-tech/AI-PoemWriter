"use client"
import './Home.css'
import { useRouter } from 'next/navigation';

export default function Home() {
  const router=useRouter();
  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <img src="/logo_img.png" alt="Poetic AI Logo" className="logo" />
        <h1 className="title">Poetic AI</h1>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <h2>Unleash the beauty of words</h2>
        <p>
          Turn your topic or idea or picture into poems crafted in the style of legendary poets,
          powered by the magic of AI.
        </p>
        <button className="btn" onClick={()=>router.push("/write")}>Get Started</button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} Poetic AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
