module AdventOfCode2021
  class Day1
    class Part1
      def self.run(fh)
        puts new(fh.each_line.map(&:to_i)).answer
      end

      def initialize(depths)
        previous = nil
        @answer = depths.count do |depth|
          (previous && depth > previous).tap { previous = depth }
        end
      end

      attr_reader :answer
    end

    class Part2
      WINDOW = 3

      def self.run(fh)
        puts new(fh.each_line.map(&:to_i)).answer
      end

      def initialize(depths)
        buffer = []

        @answer = depths.count do |depth|
          (buffer.count == WINDOW && depth > buffer.first).tap do
            buffer.shift if buffer.count == WINDOW
            buffer.push(depth)
          end
        end
      end

      attr_reader :answer
    end
  end
end
