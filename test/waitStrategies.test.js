import { expect } from 'chai';
import { describe, it } from 'mocha';
import { fixedWait, incrementingWait, fibonacciWait, randomWait, exponentialWait } from '../src';

describe('waitStrategies', () => {
  describe('fixedWait', () => {
    it('fixedWait(1000), should always return 1000', () => {
      const wait = fixedWait(1000);
      expect(wait(1)).to.be.equal(1000);
      expect(wait(2)).to.be.equal(1000);
      expect(wait(3)).to.be.equal(1000);
    });

    it('fixedWait(0), should always return 0', () => {
      const wait = fixedWait(0);
      expect(wait(1)).to.be.equal(0);
      expect(wait(2)).to.be.equal(0);
      expect(wait(3)).to.be.equal(0);
    });
  });

  describe('incrementingWait', () => {
    it('incrementingWait(1000, 2000), should return 1000, 3000, 5000, 7000, 9000', () => {
      const wait = incrementingWait(1000, 2000);
      expect(wait(1)).to.be.equal(1000);
      expect(wait(2)).to.be.equal(3000);
      expect(wait(3)).to.be.equal(5000);
      expect(wait(4)).to.be.equal(7000);
      expect(wait(5)).to.be.equal(9000);
    });

    it('incrementingWait(1000, 2000, 8000), should return 1000, 3000, 5000, 7000, 8000', () => {
      const wait = incrementingWait(1000, 2000, 8000);
      expect(wait(1)).to.be.equal(1000);
      expect(wait(2)).to.be.equal(3000);
      expect(wait(3)).to.be.equal(5000);
      expect(wait(4)).to.be.equal(7000);
      expect(wait(5)).to.be.equal(8000);
    });
  });

  describe('fibonacciWait', () => {
    it('fibonacciWait(), should return 1, 1, 2, 3, 5, 8, 13', () => {
      const wait = fibonacciWait();
      expect(wait(1)).to.be.equal(1);
      expect(wait(2)).to.be.equal(1);
      expect(wait(3)).to.be.equal(2);
      expect(wait(4)).to.be.equal(3);
      expect(wait(5)).to.be.equal(5);
      expect(wait(6)).to.be.equal(8);
      expect(wait(7)).to.be.equal(13);
    });

    it('fibonacciWait(100), should return 100, 100, 200, 300, 500, 800, 1300', () => {
      const wait = fibonacciWait(100);
      expect(wait(1)).to.be.equal(100);
      expect(wait(2)).to.be.equal(100);
      expect(wait(3)).to.be.equal(200);
      expect(wait(4)).to.be.equal(300);
      expect(wait(5)).to.be.equal(500);
      expect(wait(6)).to.be.equal(800);
      expect(wait(7)).to.be.equal(1300);
    });

    it('fibonacciWait(100, 800), should return 100, 100, 200, 300, 500, 800, 800', () => {
      const wait = fibonacciWait(100, 800);
      expect(wait(1)).to.be.equal(100);
      expect(wait(2)).to.be.equal(100);
      expect(wait(3)).to.be.equal(200);
      expect(wait(4)).to.be.equal(300);
      expect(wait(5)).to.be.equal(500);
      expect(wait(6)).to.be.equal(800);
      expect(wait(7)).to.be.equal(800);
    });
  });

  describe('randomWait', () => {
    it('randomWait(35, 45), should return a number between 35 and 45', () => {
      const wait = randomWait(35, 45);
      expect(wait(1)).to.be.within(35, 45);
      expect(wait(2)).to.be.within(35, 45);
      expect(wait(3)).to.be.within(35, 45);
      expect(wait(4)).to.be.within(35, 45);
      expect(wait(5)).to.be.within(35, 45);
      expect(wait(6)).to.be.within(35, 45);
      expect(wait(7)).to.be.within(35, 45);
      expect(wait(8)).to.be.within(35, 45);
      expect(wait(9)).to.be.within(35, 45);
      expect(wait(10)).to.be.within(35, 45);
      expect(wait(11)).to.be.within(35, 45);
      expect(wait(12)).to.be.within(35, 45);
      expect(wait(13)).to.be.within(35, 45);
      expect(wait(14)).to.be.within(35, 45);
      expect(wait(15)).to.be.within(35, 45);
    });
  });

  describe('exponentialWait', () => {
    it('exponentialWait(), should return 2, 4, 8, 16, 32, 64', () => {
      const wait = exponentialWait();
      expect(wait(1)).to.be.equal(2);
      expect(wait(2)).to.be.equal(4);
      expect(wait(3)).to.be.equal(8);
      expect(wait(4)).to.be.equal(16);
      expect(wait(5)).to.be.equal(32);
      expect(wait(6)).to.be.equal(64);
    });

    it('exponentialWait(100, 3200), should return 200, 400, 800, 1600, 3200, 3200', () => {
      const wait = exponentialWait(100, 3200);
      expect(wait(1)).to.be.equal(200);
      expect(wait(2)).to.be.equal(400);
      expect(wait(3)).to.be.equal(800);
      expect(wait(4)).to.be.equal(1600);
      expect(wait(5)).to.be.equal(3200);
      expect(wait(6)).to.be.equal(3200);
    });
  });
});
