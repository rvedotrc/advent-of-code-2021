# frozen_string_literal: true

module AdventOfCode2021
  class Day14
    class Part1 < Base
      def calculate(lines)
        lines = lines.to_a
        template = lines.shift.chomp
        lines.shift

        rules = lines.map do |line|
          [line[0..1], line[-2]]
        end.to_h

        10.times do
          template = mutate(template, rules)
        end

        score(template)
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

      def score(template)
        scores = template.chars.tally.entries.sort_by(&:last)
        scores.last[1] - scores.first[1]
      end
    end

    class Part2 < Base
      def calculate(lines)
      end
    end
  end
end
