from result_parser import parse_gemini_result


sample = """
Based on the visual evidence provided:

1. **What physical problem is visible?** A deep pothole containing water surrounded by cracked asphalt pavement and orange spray paint markings.

2. **Do the two images appear to show the same location?** Yes, the images show the specific area before and after road repair work.

3. **Is the problem still visible?** No.

4. **What physical change occurred?** The damaged area has been completely covered and level-filled with a rectangular fresh asphalt patch.

**Classification:** VERIFIED
"""


result = parse_gemini_result(sample)

print("\n========== PARSED VERITY RESULT ==========")
print(result)
print("===========================================\n")