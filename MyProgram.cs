using System;

namespace MyApp
{
    internal class Program
    {
        private int counter = 0;
        private static Actor[] actors =
        [
            new Actor { Name = "Alice" },
            new Actor { Name = "Bob" },
            new Actor { Name = "Charlie" },
            new Actor { Name = "Diana" },
            new Actor { Name = "Ethan" },
            new Actor { Name = "Fiona" },
            new Actor { Name = "George" },
            new Actor { Name = "Hannah" },
            new Actor { Name = "Ivan" },
            new Actor { Name = "Julia" }
        ];

        static void Main(string[] args)
        {
            if (TryFindActorByName("Julia"))
            {
                Console.WriteLine("Julia found");
            }
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
    }
}