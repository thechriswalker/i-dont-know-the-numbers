# I don't know the numbers

There was an interesting question brought up on Hackernews the other day. It was a seemingly intractable math problem.

## Question

```
Two numbers are chosen randomly, both are positive integers smaller than 100. Sandy is told the sum of the numbers, while Peter is told the product of the numbers.

Then, this dialog occurs between Sandy and Peter:

Peter: I don’t know the numbers.
Sandy: I don’t know the numbers.
Peter: I don’t know the numbers.
Sandy: I don’t know the numbers.
Peter: I don’t know the numbers.
Sandy: I don’t know the numbers.
Peter: I don’t know the numbers.
Sandy: I don’t know the numbers.
Peter: I don’t know the numbers.
Sandy: I don’t know the numbers.
Peter: I don’t know the numbers.
Sandy: I don’t know the numbers.
Peter: I don’t know the numbers.
Sandy: I don’t know the numbers.

Peter: I do know the numbers.

What are the numbers?
```

## Solution

Of course this isn't intractable and despite the statements not appearing to provide any extra information on the surface, they do in fact give different information every time.

Firstly, Peter's initial statement shows us that the two numbers are not `1` and a prime, or two primes whose product is `>= 100`.

Armed with the knowledge that the numbers **aren't** those, Sandy can discount those possibilities, but alas, she still doesn't have a unique solution for her sum, and says so.

Peter, who has now also discounted the ones that Sandy couldn't have had, checks to see if he has a unique solution for his product. No, he doesn't, which means all the single option solutions left can be discarded.

And repeat, after the 15 rounds, Peter does know the number, which means that his product now has only one possible solution.

I can't keep all the data in my head, but we can do it in code easily. Interestingly, there are a number of rounds in which Peter or Sandy _could_ have claimed to know the numbers. On those rounds the solution is different! So the exact length of the exchange is an integral part of the problem.

## code

```
usage: deno run numbers.ts [options]

options:
    -n <num>    max number to choose from (default: 100 - numbers 1-99)
                if provided must be an integer > 1
    -r <num>    target round for answer, if no result that round - stop anyway
                default is "no choice" which prints all possible solutions.
                if provided must be an integer > 0
```