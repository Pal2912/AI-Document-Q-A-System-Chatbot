/**
 * Three-dot "typing" animation, shown while waiting for the first token of
 * a streaming response (i.e. content is still empty but isStreaming=true).
 */
export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-ink-faint dark:bg-paper-text-faint"
          style={{
            animation: "typing-bounce 1.2s infinite ease-in-out",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes typing-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-3px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
