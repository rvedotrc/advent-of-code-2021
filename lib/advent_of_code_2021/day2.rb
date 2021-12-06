module AdventOfCode2021
  class Day2
    class Part1 < Base
      def self.run(fh)
        puts new(fh.each_line).answer
      end

      def initialize(lines)
        x = y = 0

        lines.each do |line|
          case line
          when /^forward (\d+)$/
            x += $1.to_i
          when /^down (\d+)$/
            y += $1.to_i
          when /^up (\d+)$/
            y -= $1.to_i
          else
            raise "? #{line}"
          end
        end

        @answer = x * y
      end
    end

    class Part2 < Base
      def self.run(fh)
        puts new(fh.each_line).answer
      end

      def initialize(lines)
        x = y = aim = 0

        lines.each do |line|
          case line
          when /^forward (\d+)$/
            x += $1.to_i
            y += aim * $1.to_i
          when /^down (\d+)$/
            aim += $1.to_i
          when /^up (\d+)$/
            aim -= $1.to_i
          else
            raise "? #{line}"
          end
        end

        @answer = x * y
      end
    end
  end
end
