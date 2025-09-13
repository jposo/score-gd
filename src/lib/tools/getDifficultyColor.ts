export default function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "Extreme Demon":
      return "text-error";
    case "Insane Demon":
      return "text-warning";
    case "Hard Demon":
      return "text-orange-500";
    case "Medium Demon":
      return "text-yellow-500";
    case "Easy Demon":
      return "text-green-500";
    case "Insane":
      return "text-purple-500";
    case "Harder":
      return "text-blue-500";
    case "Hard":
      return "text-cyan-500";
    case "Normal":
      return "text-green-400";
    case "Easy":
      return "text-gray-400";
    default:
      return "text-base-content";
  }
}
