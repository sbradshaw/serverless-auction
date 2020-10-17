describe("Canary test", () => {
  it("should return expected truthy value", () => {
    const expectedResponse = true;

    expect(expectedResponse).toEqual(true);
  });

  it("should return expected falsey value", () => {
    const expectedResponse = false;

    expect(expectedResponse).not.toEqual(true);
  });
});
