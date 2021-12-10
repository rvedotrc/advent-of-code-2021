module AdventOfCode2021
  class Day9
    class Part1 < Base
      def calculate(lines)
        lines = lines.map(&:chomp)

        minima = lines.each_with_index.map do |line, y|
          line.chars.each_with_index.map do |char, x|
            next if x > 0 && char >= line[x - 1]
            next if x < line.length - 1 && char >= line[x + 1]
            next if y > 0 && char >= lines[y - 1][x]
            next if y < lines.length - 1 && char >= lines[y + 1][x]
            char.to_i
          end.compact
        end.flatten(1).compact

        minima.sum + minima.count
      end
    end

    class Part2 < Base
      def calculate(lines)
        lines = lines.map(&:chomp).map { |s| s.tr('[0-8]', '0').tr('9', ' ') }

        puts *lines
        puts

        code = 64
        get_next_area_key = proc do
          code += 1
          [code].pack("C*")
        end
        used_area_keys = []

        # Replace horizontal sequences by rapidly-assigned area keys
        lines = lines.map do |line|
          line.gsub(/(0+)/) do
            area_key = get_next_area_key.call
            used_area_keys << area_key
            area_key * $1.length
          end
        end

        puts *lines
        puts

        lines = lines.map(&:chars).transpose.map(&:join)

        puts *lines
        puts

        used_area_keys = lines.join.tr(' ', '').chars.uniq

        require 'set'
        aliases = used_area_keys.map do |k|
          [k, Set.new([k])]
        end.to_h

        lines.each do |line|
          line.scan(/[^0 ]+/) do |sequence|
            equivalents = sequence.chars.sort.uniq
            x = equivalents.shift

            equivalents.each do |y|
              aliases[x].merge(aliases[y])

              aliases[x].each do |y|
                aliases[y] = aliases[x]
              end
            end
          end
        end

        pools = aliases.values.uniq.map do |chars|
          key = chars.to_a.sort.join
          count = lines.join.tr(key, '.').count('.')
          [key, count]
        end.to_h

        p pools

        pools.entries.sort_by(&:last).reverse.take(3).map(&:last).reduce(&:*)
      end
    end
  end
end
