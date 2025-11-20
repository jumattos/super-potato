using Xunit;

namespace TestConsoleApp.Tests;

public class ClassTests
{
    [Fact]
    public void Name_GetSet_Works()
    {
        var c = new Class();
        c.Name = "Sample";
        Assert.Equal("Sample", c.Name);
    }

    [Theory]
    [InlineData("")]
    [InlineData("Test")]
    [InlineData("Another Name")]    
    public void Name_VariousValues_RoundTrip(string value)
    {
        var c = new Class { Name = value };
        Assert.Equal(value, c.Name);
    }
}
