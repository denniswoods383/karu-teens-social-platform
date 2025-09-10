export default function FeatureGrid() {
  const features = [
    { icon: '🎓', title: 'Study Groups', desc: 'Join study sessions' },
    { icon: '💬', title: 'Real-time Chat', desc: 'Connect instantly' },
    { icon: '📚', title: 'Past Papers', desc: 'Practice exams' },
    { icon: '🤖', title: 'AI Assistant', desc: 'Get homework help' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {features.map((feature, i) => (
        <div key={i} className="text-center p-6 bg-white rounded-xl shadow-sm">
          <div className="text-3xl mb-3">{feature.icon}</div>
          <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
          <p className="text-sm text-gray-600">{feature.desc}</p>
        </div>
      ))}
    </div>
  );
}