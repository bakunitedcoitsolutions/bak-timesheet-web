const Badge = ({ text }: { text: string }) => {
  return (
    <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center shrink-0">
      <span className="text-white text-base font-bold">{text}</span>
    </div>
  );
};

export default Badge;
