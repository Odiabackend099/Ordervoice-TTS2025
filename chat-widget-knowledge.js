/**
 * OrderVoice Chat Widget Knowledge Base
 * Comprehensive information about the project for AI-powered chat
 */

const ORDERVOICE_KNOWLEDGE = {
  // Company Information
  company: {
    name: "OrderVoice",
    tagline: "Voice-Powered Food Ordering for Nigeria",
    description: "AI-powered voice ordering platform that makes food ordering as simple as speaking. Built specifically for the Nigerian market with support for local cuisines, payment methods, and delivery networks.",
    mission: "To revolutionize food ordering in Nigeria by making it accessible to everyone through natural voice interactions in multiple Nigerian languages and English.",
    location: "Nigeria",
    email: "hello@ordervoice.ng",
    phone: "+234 (0) 800 ORDER-NOW",
    website: "https://ordervoice.odia.dev"
  },

  // Product Features
  features: [
    {
      name: "Natural Voice Ordering",
      description: "Order food using your voice in English or Nigerian languages like Yoruba, Igbo, and Hausa. Our AI understands context and local expressions.",
      benefits: ["Hands-free ordering", "Natural conversation", "No typing needed", "Multi-language support"]
    },
    {
      name: "Ultra-Low Latency",
      description: "Industry-leading response times (400-800ms) comparable to Vapi and ChatGPT Voice, powered by Deepgram STT, Groq LLM, and MiniMax TTS.",
      benefits: ["Real-time responses", "Natural interruption handling", "Smooth conversation flow", "Sentence-level streaming"]
    },
    {
      name: "Smart Menu Understanding",
      description: "AI understands Nigerian food items, local preparations, and customization preferences. Knows the difference between party jollof and regular jollof!",
      benefits: ["Context-aware", "Cultural understanding", "Smart recommendations", "Handles variations"]
    },
    {
      name: "Multi-Restaurant Support",
      description: "Order from multiple restaurants in one conversation. Compare prices, check availability, and combine orders.",
      benefits: ["Wide selection", "Price comparison", "Real-time availability", "Unified checkout"]
    },
    {
      name: "Nigerian Payment Integration",
      description: "Supports Paystack, Flutterwave, bank transfers, USSD, and cash on delivery. Full integration with local payment methods.",
      benefits: ["Multiple payment options", "Secure transactions", "Instant confirmation", "Mobile money support"]
    },
    {
      name: "Real-Time Order Tracking",
      description: "Voice updates on order status. Ask 'Where is my order?' and get instant updates with estimated delivery time.",
      benefits: ["Live tracking", "Voice notifications", "Delivery updates", "ETA estimates"]
    }
  ],

  // Voice Technology
  technology: {
    stt: {
      provider: "Deepgram",
      model: "Nova-2",
      latency: "50-100ms",
      features: ["WebSocket streaming", "Interim results", "VAD events", "Punctuation"]
    },
    llm: {
      provider: "Groq",
      model: "Llama 3.3 70B Versatile",
      latency: "150-300ms",
      features: ["Streaming responses", "Sentence-level chunking", "Context awareness", "500+ tokens/second"]
    },
    tts: {
      provider: "MiniMax",
      model: "Speech-02-HD",
      latency: "200-400ms",
      voices: [
        { name: "Austyn", type: "Male", accent: "African", description: "Confident and professional" },
        { name: "Joslyn", type: "Female", accent: "African", description: "Warm and engaging" }
      ],
      features: ["WebSocket streaming", "Natural prosody", "African accents", "Low latency"]
    },
    totalLatency: "400-800ms end-to-end"
  },

  // Pricing Plans
  pricing: [
    {
      name: "Starter",
      price: "₦15,000/month",
      description: "Perfect for small restaurants and food vendors",
      features: [
        "Up to 500 voice orders/month",
        "1 restaurant location",
        "Basic menu management",
        "Email support",
        "Standard voice AI",
        "Real-time order tracking",
        "Basic analytics"
      ],
      limitations: ["Limited to 500 orders", "Single location", "Email support only"],
      ideal: "Small restaurants, food trucks, cloud kitchens"
    },
    {
      name: "Professional",
      price: "₦45,000/month",
      description: "For growing restaurants and chains",
      features: [
        "Up to 2,000 voice orders/month",
        "Up to 5 restaurant locations",
        "Advanced menu customization",
        "Priority support (WhatsApp + Email)",
        "Premium voice AI with faster responses",
        "Advanced analytics & insights",
        "Custom voice prompts",
        "Peak hours optimization",
        "Integration with POS systems"
      ],
      popular: true,
      ideal: "Restaurant chains, popular eateries, franchises"
    },
    {
      name: "Enterprise",
      price: "Custom pricing",
      description: "For large chains and aggregators",
      features: [
        "Unlimited voice orders",
        "Unlimited locations",
        "Full white-label solution",
        "Dedicated account manager",
        "24/7 priority support",
        "Custom AI training",
        "Multi-language support (Yoruba, Igbo, Hausa)",
        "API access",
        "Custom integrations",
        "Advanced fraud detection",
        "Dedicated infrastructure"
      ],
      ideal: "Large chains, food aggregators, enterprise clients"
    }
  ],

  // Supported Cuisines
  cuisines: [
    {
      name: "Nigerian Cuisine",
      items: ["Jollof Rice", "Fried Rice", "Egusi Soup", "Pounded Yam", "Suya", "Moi Moi", "Akara", "Pepper Soup", "Efo Riro", "Amala"]
    },
    {
      name: "Continental",
      items: ["Pasta", "Pizza", "Burgers", "Sandwiches", "Salads", "Steaks"]
    },
    {
      name: "Chinese",
      items: ["Fried Rice", "Spring Rolls", "Sweet & Sour", "Noodles"]
    },
    {
      name: "Fast Food",
      items: ["Chicken & Chips", "Shawarma", "Burgers", "Hot Dogs", "Wings"]
    },
    {
      name: "Drinks",
      items: ["Chapman", "Zobo", "Palm Wine", "Fresh Juice", "Soft Drinks"]
    }
  ],

  // How It Works
  howItWorks: [
    {
      step: 1,
      title: "Call or Tap",
      description: "Click the voice button on our website, call our hotline, or use the mobile app. No typing needed!"
    },
    {
      step: 2,
      title: "Speak Your Order",
      description: "Tell our AI what you want in your own words. 'I want party jollof rice with two pieces of chicken and a cold Coke.' It understands context and Nigerian expressions."
    },
    {
      step: 3,
      title: "AI Confirms",
      description: "The AI repeats your order, suggests sides or drinks, and confirms your delivery address. You can make changes by just speaking."
    },
    {
      step: 4,
      title: "Choose Payment",
      description: "Pay with Paystack, Flutterwave, bank transfer, USSD, or cash on delivery. All secure and instant."
    },
    {
      step: 5,
      title: "Track & Receive",
      description: "Get real-time voice updates. Ask 'Where is my food?' anytime. Enjoy your meal when it arrives!"
    }
  ],

  // Integration Options
  integrations: {
    payments: ["Paystack", "Flutterwave", "Paga", "OPay", "Bank Transfer", "USSD", "Cash on Delivery"],
    delivery: ["Gokada", "MAX.ng", "Kwik Delivery", "SendBox", "Custom fleet integration"],
    pos: ["Square", "Toast POS", "Clover", "Custom POS systems"],
    restaurants: ["Direct API", "Menu sync", "Real-time inventory", "Order management"]
  },

  // FAQ
  faq: [
    {
      question: "How accurate is the voice recognition?",
      answer: "Our AI has 95%+ accuracy and understands Nigerian accents, expressions, and food terminology. It gets better with every conversation and can handle background noise effectively."
    },
    {
      question: "What languages do you support?",
      answer: "Currently English with Nigerian expressions. We're adding Yoruba, Igbo, and Hausa in Q2 2025. The AI already understands code-switching between English and Nigerian languages."
    },
    {
      question: "How fast are the responses?",
      answer: "Our ultra-low latency system responds in 400-800ms, comparable to ChatGPT Voice and Vapi. This is achieved through WebSocket streaming, sentence-level chunking, and parallel processing."
    },
    {
      question: "Can I interrupt the AI?",
      answer: "Yes! Our Voice Activity Detection (VAD) system detects when you start speaking and automatically interrupts the AI with a smooth 100ms fade-out. It's a natural conversation."
    },
    {
      question: "What payment methods are supported?",
      answer: "We support all major Nigerian payment methods: Paystack, Flutterwave, bank transfers, USSD codes, mobile money (OPay, Paga), and cash on delivery."
    },
    {
      question: "How does delivery tracking work?",
      answer: "You can ask 'Where is my order?' anytime and get a voice update with the current status and estimated delivery time. We integrate with major Nigerian delivery services."
    },
    {
      question: "Can I order from multiple restaurants?",
      answer: "Yes! Tell the AI you want to order from different places and it will handle multiple orders in one conversation, even comparing prices and availability."
    },
    {
      question: "Is my payment information secure?",
      answer: "Absolutely! We use bank-level encryption and don't store card details. All payments are processed through PCI-DSS compliant providers like Paystack and Flutterwave."
    },
    {
      question: "What if the AI doesn't understand me?",
      answer: "The AI will politely ask you to repeat or clarify. It learns from context and can make smart suggestions. You can also switch to text chat or speak to a human agent anytime."
    },
    {
      question: "Do you charge extra fees?",
      answer: "No hidden fees! The price you see is what you pay. Some restaurants may have their own delivery fees, which the AI will clearly communicate before you confirm."
    }
  ],

  // Use Cases
  useCases: [
    {
      title: "Busy Professionals",
      scenario: "Order lunch while driving, in meetings, or multitasking. Hands-free and fast."
    },
    {
      title: "Elderly Users",
      scenario: "No need to navigate complex apps or menus. Just speak naturally and order food."
    },
    {
      title: "Restaurants",
      scenario: "Reduce phone call volume, automate order taking, and serve more customers efficiently."
    },
    {
      title: "Delivery Drivers",
      scenario: "Place orders hands-free while on the road. Voice confirmation and updates."
    },
    {
      title: "Office Bulk Orders",
      scenario: "Order for the whole team in one conversation. Split payments and multiple addresses."
    }
  ],

  // Technical Specs
  technicalSpecs: {
    architecture: "Microservices with WebSocket streaming",
    infrastructure: "Cloud-based with 99.9% uptime SLA",
    security: "Bank-level encryption, HTTPS, secure WebSocket (WSS)",
    scalability: "Auto-scaling to handle peak hours",
    apiAvailability: "RESTful API and WebSocket API for enterprise clients",
    compliance: "NDPR compliant, PCI-DSS payment processing"
  },

  // Contact & Support
  support: {
    email: "hello@ordervoice.ng",
    phone: "+234 (0) 800 ORDER-NOW",
    whatsapp: "+234 (0) 800 ORDER-NOW",
    hours: "24/7 for Professional and Enterprise plans, Business hours for Starter",
    demo: "Book a free demo at ordervoice.odia.dev/demo",
    documentation: "Full API docs available for Enterprise clients"
  },

  // Quick Actions
  quickActions: {
    tryDemo: {
      text: "Try Voice Demo",
      url: "voice-streaming-demo.html",
      description: "Experience our ultra-low latency voice system"
    },
    seePricing: {
      text: "View Pricing",
      url: "pricing.html",
      description: "Compare plans and choose what's right for you"
    },
    bookDemo: {
      text: "Book Demo",
      url: "demo.html",
      description: "Schedule a personalized demonstration"
    },
    contactSales: {
      text: "Contact Sales",
      url: "contact.html",
      description: "Speak with our sales team"
    }
  }
};

// Helper functions for the chat widget
const ChatWidgetHelpers = {
  /**
   * Search knowledge base
   */
  searchKnowledge(query) {
    const lowerQuery = query.toLowerCase();
    const results = [];

    // Search FAQ
    ORDERVOICE_KNOWLEDGE.faq.forEach(item => {
      if (item.question.toLowerCase().includes(lowerQuery) ||
          item.answer.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'faq',
          data: item,
          relevance: this.calculateRelevance(query, item.question + ' ' + item.answer)
        });
      }
    });

    // Search features
    ORDERVOICE_KNOWLEDGE.features.forEach(feature => {
      if (feature.name.toLowerCase().includes(lowerQuery) ||
          feature.description.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'feature',
          data: feature,
          relevance: this.calculateRelevance(query, feature.name + ' ' + feature.description)
        });
      }
    });

    // Search pricing
    ORDERVOICE_KNOWLEDGE.pricing.forEach(plan => {
      if (plan.name.toLowerCase().includes(lowerQuery) ||
          plan.description.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'pricing',
          data: plan,
          relevance: this.calculateRelevance(query, plan.name + ' ' + plan.description)
        });
      }
    });

    return results.sort((a, b) => b.relevance - a.relevance);
  },

  /**
   * Calculate relevance score
   */
  calculateRelevance(query, text) {
    const queryWords = query.toLowerCase().split(' ');
    const textLower = text.toLowerCase();
    let score = 0;

    queryWords.forEach(word => {
      if (textLower.includes(word)) {
        score += 1;
      }
    });

    return score;
  },

  /**
   * Get contextual response
   */
  getContextualResponse(userMessage) {
    const message = userMessage.toLowerCase();

    // Pricing queries
    if (message.includes('price') || message.includes('cost') || message.includes('pricing')) {
      return {
        type: 'pricing',
        data: ORDERVOICE_KNOWLEDGE.pricing,
        quickAction: 'seePricing'
      };
    }

    // Technical queries
    if (message.includes('latency') || message.includes('fast') || message.includes('technology')) {
      return {
        type: 'technology',
        data: ORDERVOICE_KNOWLEDGE.technology,
        quickAction: 'tryDemo'
      };
    }

    // Feature queries
    if (message.includes('feature') || message.includes('what can') || message.includes('capabilities')) {
      return {
        type: 'features',
        data: ORDERVOICE_KNOWLEDGE.features,
        quickAction: 'tryDemo'
      };
    }

    // Contact queries
    if (message.includes('contact') || message.includes('support') || message.includes('help')) {
      return {
        type: 'support',
        data: ORDERVOICE_KNOWLEDGE.support,
        quickAction: 'contactSales'
      };
    }

    // Demo queries
    if (message.includes('demo') || message.includes('try') || message.includes('test')) {
      return {
        type: 'demo',
        data: ORDERVOICE_KNOWLEDGE.quickActions.tryDemo,
        quickAction: 'tryDemo'
      };
    }

    // Default: search knowledge base
    const results = this.searchKnowledge(userMessage);
    if (results.length > 0) {
      return {
        type: results[0].type,
        data: results[0].data
      };
    }

    return null;
  }
};

// Export for use in chat widget
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ORDERVOICE_KNOWLEDGE, ChatWidgetHelpers };
}
