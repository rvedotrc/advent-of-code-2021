# frozen_string_literal: true

module AdventOfCode2021
  class Base
    def self.run(fh)
      puts new(fh.each_line).answer
    end

    def initialize(lines)
      @answer = calculate(lines)
    end

    attr_reader :answer
  end
end
