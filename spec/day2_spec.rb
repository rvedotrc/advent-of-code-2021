require_relative '../lib/advent_of_code_2021'

describe AdventOfCode2021::Day2 do
  describe AdventOfCode2021::Day2::Part1 do
    def test(text, expected)
      actual = described_class.new(text.each_line).answer
      expect(actual).to eq(expected)
    end

    it "handles the test data" do
      test(<<~DATA, 150)
        forward 5
        down 5
        forward 8
        up 3
        down 8
        forward 2
      DATA
    end
  end

  describe AdventOfCode2021::Day2::Part2 do
    def test(text, expected)
      actual = described_class.new(text.each_line).answer
      expect(actual).to eq(expected)
    end

    it "handles the test data" do
      test(<<~DATA, 900)
        forward 5
        down 5
        forward 8
        up 3
        down 8
        forward 2
      DATA
    end
  end
end
