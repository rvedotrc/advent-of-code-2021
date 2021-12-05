require_relative '../lib/advent_of_code_2021'

describe AdventOfCode2021::Day1 do
  describe AdventOfCode2021::Day1::Part1 do
    def test(depths, expected)
      actual = described_class.new(depths).answer
      expect(actual).to eq(expected)
    end

    it "handles empty" do
      test([], 0)
    end

    it "handles singleton" do
      test([99], 0)
    end

    it "handles a small list" do
      test([1, 1, 3, 3, 4], 2)
    end

    it "handles a small list" do
      test([5, 1, 6, 1], 1)
    end
  end

  describe AdventOfCode2021::Day1::Part2 do
    def test(depths, expected)
      actual = described_class.new(depths).answer
      expect(actual).to eq(expected)
    end

    it "handles the example" do
      test([607, 618, 618, 617, 647, 716, 769, 792], 5)
    end
  end
end
