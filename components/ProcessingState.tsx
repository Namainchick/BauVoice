'use client';

export default function ProcessingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-4 h-4 bg-green-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>

      <p className="text-gray-600 text-lg text-center">
        Ich analysiere deinen Bericht...
      </p>
      <p className="text-gray-400 text-sm text-center">
        Das dauert nur ein paar Sekunden
      </p>
    </div>
  );
}
