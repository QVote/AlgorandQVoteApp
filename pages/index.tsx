import { DecisionCreator } from "../components/DecisionCreator";
import { getInitDecision } from "../scripts";

export default function Create() {
  return <DecisionCreator initDecision={getInitDecision()} />;
}
