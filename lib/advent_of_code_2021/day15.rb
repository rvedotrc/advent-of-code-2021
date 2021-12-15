# frozen_string_literal: true

module AdventOfCode2021
  class Day15
    class Part1 < Base
      attr_reader :lines, :max_x, :max_y, :unvisited

      def calculate(input_lines)
        @lines = input_lines.map(&:chomp).to_a
        @max_x = lines.first.length - 1
        @max_y = lines.length - 1

        require 'set'
        @unvisited = Set.new(
          (0..max_y).map do |y|
            (0..max_x).map do |x|
              [x, y]
            end
          end.flatten(1)
        )

        tentative_distance = {} # nil = Infinity
        tentative_distance[ [0, 0] ] = 0

        iterations = 0
        current = [0, 0]
        puts((max_x + 1) * (max_y + 1))

        while true
          unvisited_neighbours = unvisited_neighbours_of(*current)

          unvisited_neighbours.each do |neighbour|
            distance = tentative_distance[current] + lines[neighbour.last][neighbour.first].to_i

            if !tentative_distance[neighbour] || distance < tentative_distance[neighbour]
              tentative_distance[neighbour] = distance
            end
          end

          iterations += 1
          if iterations % 1000 == 0
            puts iterations
          end

          unvisited.delete(current)
          break if current == [max_x, max_y]

          current = unvisited \
            .select { |pos| tentative_distance.include?(pos) } \
            .sort_by { |pos| tentative_distance[pos] } \
            .first
        end

        tentative_distance[[max_x, max_y]]
      end

      def neighbours_of(x, y)
        [
          ([x - 1, y] if x > 0),
          ([x + 1, y] if x < max_x),
          ([x, y - 1] if y > 0),
          ([x, y + 1] if y < max_y),
        ].compact
      end

      def unvisited_neighbours_of(x, y)
        neighbours_of(x, y).select { |pos| unvisited.include?(pos) }
      end
    end

    class Part2 < Part1
      def calculate(input_lines)


        super(input_lines)
      end
    end
  end
end
