using Xunit;

namespace TestConsoleApp.Tests;

public class ClassTests
{
    [Fact]
    public void Name_GetSet_Works()
    {
        var actor = new Actor();
        actor.Name = "Sample";
        Assert.Equal("Sample", actor.Name);
    }

    [Theory]
    [InlineData("")]
    [InlineData("Test")]
    [InlineData("Another Name")]
    public void Name_VariousValues_RoundTrip(string value)
    {
        var actor = new Actor { Name = value };
        Assert.Equal(value, actor.Name);
    }
}
