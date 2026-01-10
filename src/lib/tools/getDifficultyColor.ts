export default function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "extreme demon":
      return "text-red-800";
    case "insane demon":
      return "text-rose-700";
    case "hard demon":
      return "text-rose-500";
    case "medium demon":
      return "text-pink-600";
    case "easy demon":
      return "text-purple-400";
    case "insane":
      return "text-fuchsia-400";
    case "harder":
      return "text-red-500";
    case "hard":
      return "text-yellow-500";
    case "normal":
      return "text-green-400";
    case "easy":
      return "text-blue-800";
    case "auto":
      return "text-amber-500";
    default:
      return "text-base-content";
  }
}
