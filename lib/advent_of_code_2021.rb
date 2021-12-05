require_relative './advent_of_code_2021/day1'

module AdventOfCode2021
  def self.test(day_number, part_number)
    require_relative "./advent_of_code_2021/day#{day_number}"
    klass = const_get("Day#{day_number}").const_get("Part#{part_number}")
    File.open("input/day#{day_number}") do |fh|
      klass.run(fh)
    end
  end
end
