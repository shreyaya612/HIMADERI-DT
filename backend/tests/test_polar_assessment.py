import sys
import unittest
from pathlib import Path
from unittest.mock import patch

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ai.rag import rag_assistant


SOP_RESULT = [{
    "score": 0.91,
    "text": "HIMADRI-DT — GENERATOR OPERATING PROCEDURE\n"
            "If generator temperature is unusually high:\n"
            "- Check the cooling system and airflow.\n"
            "- Check coolant levels if applicable.\n"
            "- Inspect ventilation paths for blockage.\n"
            "If temperature continues to rise, reduce operational load where safe and request maintenance inspection.",
}]
ANOMALOUS = {"is_anomaly": True, "risk": "HIGH", "anomaly_score": -0.2, "health": 20}
NORMAL = {"is_anomaly": False, "risk": "LOW", "anomaly_score": 0.3, "health": 100}
TELEMETRY = {"temperature": 96, "vibration": 0.85, "load": 94, "rpm": 1400, "fuel_rate": 22}


class PolarAssessmentTests(unittest.TestCase):
    def assessment(self, telemetry=TELEMETRY, predictive=ANOMALOUS):
        with patch.object(rag_assistant, "retrieve", return_value=SOP_RESULT), patch.object(
            rag_assistant, "ask_local_llm", return_value="Review the approved cooling checks promptly."
        ):
            return rag_assistant.answer_question("Why is Generator 02 showing elevated temperature?", telemetry, predictive)

    def test_elevated_generator_temperature_returns_structured_evidence(self):
        result = self.assessment()
        self.assertEqual(result["risk"], "HIGH")
        self.assertEqual(result["telemetry"]["temperature"], 96)
        self.assertTrue(result["recommended_actions"])
        self.assertIn("Possible contributing factor", " ".join(result["likely_causes"]))
        self.assertIn("Generator Operating Procedure", result["source"])

    def test_normal_generator_does_not_claim_a_failure(self):
        result = self.assessment({"temperature": 76, "vibration": 0.32, "load": 72, "rpm": 1500, "fuel_rate": 15}, NORMAL)
        self.assertIn("not flagged", result["problem"])
        self.assertIn("No likely cause", result["likely_causes"][0])

    def test_missing_telemetry_is_explicit(self):
        result = self.assessment(None, None)
        self.assertEqual(result["telemetry"], {})
        self.assertIn("No current telemetry", result["problem"])
        self.assertIn("Insufficient telemetry", result["likely_causes"][0])

    def test_rag_retrieval_failure_is_reported_without_crashing(self):
        with patch.object(rag_assistant, "retrieve", side_effect=RuntimeError("index unavailable")):
            result = rag_assistant.answer_question("Generator issue", TELEMETRY, ANOMALOUS)
        self.assertEqual(result["recommended_actions"], [])
        self.assertIn("SOP retrieval unavailable", result["retrieval_error"])

    def test_ollama_unavailable_keeps_assessment_usable(self):
        with patch.object(rag_assistant, "retrieve", return_value=SOP_RESULT), patch.object(
            rag_assistant, "ask_local_llm", return_value="[Ollama Offline] unavailable"
        ):
            result = rag_assistant.answer_question("Generator issue", TELEMETRY, ANOMALOUS)
        self.assertFalse(result["ollama_available"])
        self.assertTrue(result["recommended_actions"])

    def test_offline_operation_uses_local_sop_and_does_not_require_ollama(self):
        with patch.object(rag_assistant, "retrieve", return_value=SOP_RESULT), patch.object(
            rag_assistant, "ask_local_llm", return_value="[Ollama Offline] unavailable"
        ):
            result = rag_assistant.answer_question("Generator issue", TELEMETRY, ANOMALOUS)
        self.assertIsNone(result["retrieval_error"])
        self.assertIn("cooling system", " ".join(result["recommended_actions"]).lower())
