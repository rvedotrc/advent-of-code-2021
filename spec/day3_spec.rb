require_relative '../lib/advent_of_code_2021'

describe AdventOfCode2021::Day3 do
  describe AdventOfCode2021::Day3::Part1 do
    def test(text, expected)
      actual = described_class.new(text.each_line).answer
      expect(actual).to eq(expected)
    end

    it "handles the test data" do
      test(<<~DATA, 198)
        00100
        11110
        10110
        10111
        10101
        01111
        00111
        11100
        10000
        11001
        00010
        01010
      DATA
    end
  end

  describe AdventOfCode2021::Day3::Part2 do
    def test(text, expected)
      actual = described_class.new(text.each_line).answer
      expect(actual).to eq(expected)
    end

    it "handles the test data" do
      test(<<~DATA, 230)
        00100
        11110
        10110
        10111
        10101
        01111
        00111
        11100
        10000
        11001
        00010
        01010
      DATA
    end
  end
end
