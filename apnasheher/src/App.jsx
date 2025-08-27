import { useState, useEffect, useRef } from 'react';

// Data for each feature card
const features = [
  {
    title: "Verified Service Providers",
    description: "Connect with certified electricians, plumbers, and more, complete with ratings and contact details. ✨ Get AI-powered service suggestions for your problems!",
    icon: "M17.625 15.625h-.001M17.625 15.625H16.1M17.625 15.625V14.1M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10 10-4.477 10-10z",
    color: "from-teal-500 to-cyan-500",
  },
  {
    title: "Smart Utility Mapping",
    description: "Locate public facilities like clinics, hotels, and shelters in real-time on an interactive map.",
    icon: "M9 11a3 3 0 100-6 3 3 0 000 6zM21 11a3 3 0 100-6 3 3 0 000 6zM3 21a3 3 0 100-6 3 3 0 000 6zM21 21a3 3 0 100-6 3 3 0 000 6z",
    color: "from-purple-500 to-indigo-500",
  },
  {
    title: "Emergency Help Locator",
    description: "Get immediate access to the nearest hospitals, police stations, and fire departments with live location.",
    icon: "M12 21a9 9 0 100-18 9 9 0 000 18zM15 12h-3V7.5M12 21a9 9 0 100-18 9 9 0 000 18z",
    color: "from-red-500 to-rose-500",
  },
  {
    title: "Multilingual Interface",
    description: "The platform speaks your language. Switch between English, Hindi, and other regional languages seamlessly.",
    icon: "M10 21v-4a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2zM4 21v-4a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2zM4 11h8a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2v-6a2 2 0 012-2zM14 11h8a2 2 0 012 2v6a2 2 0 01-2 2H14a2 2 0 01-2-2v-6a2 2 0 012-2z",
    color: "from-yellow-500 to-orange-500",
  },
];

// Earth at Night image URL (from NASA, a common public domain source for this imagery)
const EARTH_NIGHT_IMAGE_URL = 'https://eoimages.gsfc.nasa.gov/images/imagerecords/55000/55167/earth_lights_lrg.jpg';

// The main App component for the homepage
export default function App() {
  const featureRefs = useRef([]);
  const [activeFeature, setActiveFeature] = useState(0);

  // State for AI Recommendation Feature
  const [userProblem, setUserProblem] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [errorAI, setErrorAI] = useState('');

  // Function to call Gemini API for AI Suggestion
  const getAiSuggestion = async () => {
    setIsLoadingAI(true);
    setAiSuggestion('');
    setErrorAI('');

    if (!userProblem.trim()) {
      setErrorAI("Please describe your problem to get a suggestion.");
      setIsLoadingAI(false);
      return;
    }

    try {
      const prompt = `Based on the following problem: "${userProblem}", suggest the type of hyperlocal service a person would need (e.g., Electrician, Plumber, Tutor). If the problem is unclear, provide a general urban service. Be concise and only provide the service type.`;
      
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = ""; // Canvas will automatically provide it at runtime
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      let response;
      let result;
      let retries = 0;
      const MAX_RETRIES = 3;
      const BASE_DELAY = 1000; // 1 second

      while (retries < MAX_RETRIES) {
        try {
          response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          result = await response.json();

          if (result.candidates && result.candidates.length > 0 &&
              result.candidates[0].content && result.candidates[0].content.parts &&
              result.candidates[0].content.parts.length > 0) {
            setAiSuggestion(result.candidates[0].content.parts[0].text);
            break; // Success, exit retry loop
          } else {
            console.error("Unexpected API response structure:", result);
            setErrorAI("Failed to get suggestion: Unexpected response.");
            break;
          }
        } catch (fetchError) {
          retries++;
          if (retries < MAX_RETRIES) {
            const delay = BASE_DELAY * Math.pow(2, retries - 1); // Exponential backoff
            await new Promise(res => setTimeout(res, delay));
          } else {
            console.error("Error calling Gemini API after multiple retries:", fetchError);
            setErrorAI("Failed to get suggestion. Please try again later.");
          }
        }
      }

    } catch (error) {
      console.error("Error during AI suggestion request:", error);
      setErrorAI("Failed to get suggestion. Please try again later.");
    } finally {
      setIsLoadingAI(false);
    }
  };


  // Intersection Observer to detect which feature card is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = features.findIndex(f => f.title === entry.target.dataset.title);
            setActiveFeature(index);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.5,
      }
    );

    featureRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      featureRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen font-inter overflow-hidden bg-gray-900 text-white">
      {/* Background Image Container */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${EARTH_NIGHT_IMAGE_URL})` }}
      ></div>

      {/* Main Content Overlay */}
      <div className="relative z-10 p-8">
        <div className="flex flex-col items-center justify-center min-h-screen text-center py-16">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-600 animate-pulse">
              ApnaSheher
            </h1>
            <p className="text-lg sm:text-2xl md:text-3xl font-light text-white leading-relaxed">
              Smart Hyperlocal Digital Urban Assistant
            </p>
            <p className="text-md sm:text-lg md:text-xl font-light max-w-2xl mx-auto text-white">
              Bridging the gap between urban citizens and essential services, one click at a time.
            </p>
            <button className="mt-8 px-8 py-4 text-lg font-bold text-white transition-transform transform bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full shadow-lg hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-300">
              Explore Your City
            </button>
          </div>
        </div>
        
        {/* Feature Highlights Section */}
        <div className="bg-gray-950 bg-opacity-70 backdrop-blur-sm rounded-3xl py-16 px-8 sm:px-12 md:px-20 lg:py-24 mt-16 mx-auto max-w-6xl shadow-2xl space-y-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                ref={el => featureRefs.current[index] = el}
                data-title={feature.title}
                className={`relative p-8 rounded-3xl shadow-xl transition-all duration-500 ${
                  activeFeature === index ? 'bg-gray-800 scale-105 border-2 border-cyan-400' : 'bg-gray-800 bg-opacity-70 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`p-4 rounded-full bg-gradient-to-br ${feature.color} text-white`}>
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                </div>
                <p className="text-gray-300 text-lg">{feature.description}</p>

                {/* AI Recommendation Feature for "Verified Service Providers" */}
                {feature.title === "Verified Service Providers" && (
                  <div className="mt-6 p-4 bg-gray-700 bg-opacity-60 rounded-xl space-y-3">
                    <p className="text-md font-semibold text-gray-200">Problem Solver (AI-Powered):</p>
                    <input
                      type="text"
                      className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                      placeholder="e.g., Leaky faucet, need a tutor"
                      value={userProblem}
                      onChange={(e) => setUserProblem(e.target.value)}
                    />
                    <button
                      onClick={getAiSuggestion}
                      className="w-full px-4 py-2 text-md font-bold text-white bg-gradient-to-r from-green-500 to-blue-500 rounded-lg shadow hover:from-green-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all duration-300 flex items-center justify-center gap-2"
                      disabled={isLoadingAI}
                    >
                      {isLoadingAI ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Suggesting...
                        </>
                      ) : (
                        '✨ Get AI Service Suggestion'
                      )}
                    </button>
                    {aiSuggestion && (
                      <p className="mt-3 text-lg text-cyan-300 font-medium">
                        Suggested Service: <span className="font-bold">{aiSuggestion}</span>
                      </p>
                    )}
                    {errorAI && (
                      <p className="mt-3 text-red-400 text-sm">Error: {errorAI}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
