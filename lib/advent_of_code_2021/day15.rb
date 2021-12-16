# frozen_string_literal: true

require 'set'

module AdventOfCode2021
  class Day15
    class Nodes
      def initialize(_nodes)
        # lookup by node
        @distances = {} # missing (nil) = infinity
        @visited = Set.new

        # unvisited (with a distance)
        @unvisited_with_distance = Set.new
      end

      def add_distance(node, distance)
        current_distance = @distances[node]
        return if current_distance && current_distance < distance

        @distances[node] = distance

        unless @visited.include?(node)
          @unvisited_with_distance.add(node)
        else
          raise # never?
        end
      end

      def visited?(node)
        @visited.include?(node)
      end

      def mark_visited(node)
        @visited << node
        @unvisited_with_distance.delete(node)
      end

      def nearest_unvisited
        @unvisited_with_distance.min_by { |n| @distances[n] || raise }
      end

      def distance_to(node)
        @distances[node]
      end
    end

    class Part1 < Base
      attr_reader :lines, :max_x, :max_y, :nodes

      def calculate(input_lines)
        @lines = input_lines.map(&:chomp).to_a
        @max_x = lines.first.length - 1
        @max_y = lines.length - 1

        @nodes = Nodes.new(
          (0..max_x).map do |x|
            (0..max_y).map do |y|
              [x, y]
            end
          end
        )

        @nodes.add_distance([0, 0], 0)

        iterations = 0
        current = [0, 0]
        puts((max_x + 1) * (max_y + 1))

        t0 = Time.now
        sort_time = 0

        while true
          unvisited_neighbours = unvisited_neighbours_of(*current)

          unvisited_neighbours.each do |neighbour|
            distance = nodes.distance_to(current) + lines[neighbour.last][neighbour.first].to_i
            nodes.add_distance(neighbour, distance)
          end

          iterations += 1
          if iterations % 1000 == 0
            puts iterations
          end

          nodes.mark_visited(current)
          break if current == [max_x, max_y]

          ts0 = Time.now
          current = nodes.nearest_unvisited
          sort_time += (Time.now - ts0)
        end

        total_time = Time.now - t0
        p [sort_time, total_time, sort_time / total_time * 100]

        nodes.distance_to([max_x, max_y])
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
        neighbours_of(x, y).reject { |pos| nodes.visited?(pos) }
      end
    end

    class Part2 < Part1
      def calculate(input_lines)
        input_lines = input_lines.map(&:chomp)

        bigger_grid = (0..4).map do |tile_y|
          input_lines.map do |line|
            (0..4).map do |tile_x|
              rotate(line, tile_x + tile_y)
            end.join
          end
        end.flatten(1)

        p input_lines
        p bigger_grid

        super(bigger_grid)
      end

      def rotate(line, n)
        n = n % 9
        old_seq = '123456789'
        new_seq = (old_seq + old_seq)[n .. n+8]
        line.tr(old_seq, new_seq)
      end
    end
  end
end
