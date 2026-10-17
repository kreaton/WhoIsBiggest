namespace WhoIsBiggest.Game;

/// <param name="MaxGap">How far apart the two numbers may be, or null for no limit.</param>
public sealed record GameLevel(int Number, string Name, int Max, int? MaxGap)
{
    public string Description => MaxGap is null ? $"1 – {Max}" : $"1 – {Max}, close";
}

public sealed class NumberGame
{
    public static readonly IReadOnlyList<GameLevel> Levels =
    [
        new(1, "Level 1", 12, null),
        new(2, "Level 2", 30, 10),
        new(3, "Level 3", 99, 10),
        new(4, "Level 4", 99, null),
    ];

    private readonly Random _random = new();

    public GameLevel Level { get; private set; } = Levels[0];

    public int Left { get; private set; }

    public int Right { get; private set; }

    public int Biggest => Math.Max(Left, Right);

    public void SetLevel(GameLevel level) => Level = level;

    /// <summary>Picks two different numbers within the level's range and gap.</summary>
    public void NewRound()
    {
        var first = _random.Next(1, Level.Max + 1);
        var gap = Level.MaxGap ?? Level.Max;
        var low = Math.Max(1, first - gap);
        var high = Math.Min(Level.Max, first + gap);

        // Pick from [low, high] while skipping 'first' so the two never match.
        var second = _random.Next(low, high);
        if (second >= first) second++;

        // Avoid repeating the exact previous pair, which feels like nothing happened.
        if ((first, second) == (Left, Right) || (first, second) == (Right, Left))
        {
            NewRound();
            return;
        }

        (Left, Right) = (first, second);
    }

    public bool IsCorrect(int pick) => pick == Biggest;
}
