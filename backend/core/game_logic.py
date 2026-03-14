class GameEngine:
    def __init__(self, mode="Infinite", lives=3):
        self.mode = mode
        self.lives = lives

    def evaluate(self, is_correct: bool):
        """
        Calculates the new state based on whether the answer was correct.
        """
        # Correct Answer
        if is_correct:
            return {
                "correct": True,
                "lives": self.lives,
                "game_over": False
            }

        # Incorrect Answer - Survival mode
        if self.mode == "Survival":
            self.lives -= 1
            return {
                "correct": False,
                "lives": self.lives,
                "game_over": self.lives <= 0
            }

        # Incorrect - Free mode
        return {
            "correct": False,
            "lives": self.lives,
            "game_over": False
        }
