import { DecisionCreator } from "../components/DecisionCreator";
import { getInitDecision } from "../components/DecisionCreator/script";

export default function Create() {
  return <DecisionCreator initDecision={getInitDecision()} />;
}
