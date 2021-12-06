module AdventOfCode2021
  class Base
    def self.run(fh)
      puts new(fh.each_line).answer
    end

    def initialize(_lines)
    end

    attr_reader :answer
  end
end
