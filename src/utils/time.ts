/**
 * Converts a time string in the format 1d2h3m4s to a number of seconds.
 * 
 * Params:
 *   timeString - the time string to convert.
 * 
 * Returns:
 *   number - the number of seconds represented by the time string. 0 seconds if invalid string
 */
export const timeStringToSeconds = (timeString: string): number => {
	let match = /^(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(timeString);

  if (!match) {
    return 0;
  }

	return 3600 * (parseInt(match[1]) || 0)
	       + 60 * (parseInt(match[2]) || 0)
	       +      (parseInt(match[3]) || 0);
};