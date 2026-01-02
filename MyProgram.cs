using System;
using System.Threading.Tasks;

namespace MyApp
{
    internal class Program // my comment is better
    {
        private int counter = 0;
        private static Actor[] actors =
        [
            new Actor { Name = "Alice" },
            new Actor { Name = "Bob" },
            new Actor { Name = "Charlie" },
            new Actor { Name = "Diana" },
            new Actor { Name = "Ethan" },
            new Actor { Name = "Hannah" },
            new Actor { Name = "Ivan" },
            new Actor { Name = "Julia" }
        ];

        static async Task Main(string[] args)
        {
            if (TryFindActorByName("Julia"))
            {
                Console.WriteLine("Julia found");
            }

            Task.Run(async () =>
            {
                await GetActorFromServerAsync("Bianca");
                await GetActorFromServerAsync("Hector");
                await GetActorFromServerAsync("Jessica");
            }).Wait();
        }

        /// <summary>
        /// Try to get the actor by name.
        /// </summary>
        /// <returns>Actor object, if found.</returns>
        static bool TryFindActorByName(string name)
        {
            if (actors.Any(a => string.Equals(a.Name, name)))
            {
                return true;
            }
            return false;
        }

        static async Task<Actor?> GetActorFromServerAsync(string name)
        {
            await Task.Delay(1000); // Simulate network delay
            return actors.FirstOrDefault(a => string.Equals(a.Name, name));
        }
    }
}