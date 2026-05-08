import { Lightbulb, AlertTriangle, CheckCircle } from "lucide-react";

interface TipBlockProps {
  text: string;
  type?: string;
}

const config = {
  info: {
    icon: Lightbulb,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    iconColor: "text-blue-500",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    iconColor: "text-amber-500",
  },
  success: {
    icon: CheckCircle,
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    iconColor: "text-brand",
  },
};

export default function TipBlock({ text, type = "info" }: TipBlockProps) {
  const style = config[type as keyof typeof config] || config.info;
  const Icon = style.icon;

  return (
    <div className={`flex gap-3 p-4 rounded-xl border ${style.bg} ${style.border}`}>
      <Icon size={18} className={`${style.iconColor} flex-shrink-0 mt-0.5`} />
      <p className={`text-sm ${style.text} leading-relaxed`}>{text}</p>
    </div>
  );
}
