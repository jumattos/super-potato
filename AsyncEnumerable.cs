using System.Runtime.CompilerServices;

namespace MyApp
{
    internal static partial class AsyncEnumerable // this is a new comment
    {
        public static IAsyncEnumerable<T> Empty<T>() => EmptyAsyncEnumerable<T>.Instance;

        class EmptyAsyncEnumerable<T> : IAsyncEnumerable<T>
        {
            public static readonly IAsyncEnumerable<T> Instance = new EmptyAsyncEnumerable<T>();

            private EmptyAsyncEnumerable() { }

            public IAsyncEnumerator<T> GetAsyncEnumerator(CancellationToken cancellationToken = default) => EmptyAsyncEnumerator<T>.Instance;
        }

        class EmptyAsyncEnumerator<T> : IAsyncEnumerator<T>
        {
            public static readonly IAsyncEnumerator<T> Instance = new EmptyAsyncEnumerator<T>();

            private EmptyAsyncEnumerator() { }

            public T Current => default;

            public ValueTask<bool> MoveNextAsync() => new ValueTask<bool>(false);

            public ValueTask DisposeAsync() => default;
        }

        public static async Task<bool> Any<T>(this IAsyncEnumerable<T> source)
        {
            await using var enumerator = source.GetAsyncEnumerator();
            return await enumerator.MoveNextAsync();
        }

        public static async Task<List<T>> ToListAsync<T>(this IAsyncEnumerable<T> values, CancellationToken cancellationToken = default)
        {
            var result = new List<T>();

            await foreach (var value in values)
            {
                if (cancellationToken.IsCancellationRequested)
                    return result;

                result.Add(value);
            }

            return result;
        }

#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        public static async IAsyncEnumerable<T> ToAsyncEnumerable<T>(this IEnumerable<T> values, [EnumeratorCancellation] CancellationToken cancellationToken = default)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        {
            foreach (var value in values)
            {
                if (cancellationToken.IsCancellationRequested)
                    break;

                yield return value;
            }
        }
    }
}
