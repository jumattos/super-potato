using System.Reflection;
using Xunit;

namespace TestConsoleApp.Tests;

public class ActorTests
{
    [Fact]
    public void Actors_HaveChineseNames()
    {
        var programType = typeof(Actor).Assembly.GetType("MyApp.Program");
        Assert.NotNull(programType);

        var actorsField = programType.GetField("actors", BindingFlags.NonPublic | BindingFlags.Static);
        Assert.NotNull(actorsField);

        var actors = Assert.IsType<Actor[]>(actorsField.GetValue(null));
        Assert.Equal(
            new[] { "爱丽丝", "鲍勃", "查理", "戴安娜", "伊森", "菲奥娜", "乔治", "汉娜", "伊万", "朱莉娅" },
            actors.Select(actor => actor.ChineseName));
    }
}
