# frozen_string_literal: true

module AdventOfCode2021
  class Day14
    class Part1 < Base
      def calculate(lines)
        template, rules = parse(lines)

        10.times do
          template = mutate(template, rules)
        end

        score(template.chars)
      end

      def parse(lines)
        lines = lines.to_a
        template = lines.shift.chomp
        lines.shift

        rules = lines.map do |line|
          [line[0..1], line[-2]]
        end.to_h

        [template, rules]
      end

      def mutate(template, rules)
        output = "".dup

        template.chars.each do |char|
          if output == ""
            output << char
          else
            key = output[-1] + char
            extra = rules[key]
            raise "No extra for #{key}" unless extra

            output << extra << char
          end
        end

        output
      end

      def score(chars)
        scores = chars.tally.entries.sort_by(&:last)
        scores.last[1] - scores.first[1]
      end
    end

    class Part2Slow < Part1
      # Probably works. Still doesn't scale.
      def calculate(lines)
        template, rules = parse(lines)
        sequence = template.each_char.lazy

        40.times do
          sequence = wrap(sequence, rules)
        end

        score(sequence)
      end

      def wrap(input, rules)
        return enum_for(:wrap, input, rules) unless block_given?

        previous = nil
        input.each do |char|
          yield rules[previous + char] if previous
          yield char
          previous = char
        end
      end
    end

    class Part2 < Part1
      def calculate(lines)
        template, rules = parse(lines)

        pair_counts = Hash.new { |h, k| h[k] = 0 }

        template.chars.each_cons(2) do |pair|
          pair_counts[pair] += 1
        end

        40.times do
          pair_counts = mutate(pair_counts, rules)
        end

        letter_counts = count_letters(pair_counts, template)

        min, max = letter_counts.values.minmax
        max - min
      end

      def mutate(pair_counts, rules)
        output = Hash.new { |h, k| h[k] = 0 }

        pair_counts.each do |(x, z), count|
          y = rules[x + z]
          output[[x, y]] += count
          output[[y, z]] += count
        end

        output
      end

      def count_letters(pair_counts, template)
        counts = Hash.new { |h, k| h[k] = 0 }

        pair_counts.each do |pair, v|
          counts[pair.first] += v
          counts[pair.last] += v
        end

        counts[template.chars.first] += 1
        counts[template.chars.last] += 1

        counts.transform_values { |n| n / 2 }
      end
    end
  end
end
