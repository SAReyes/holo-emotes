export function generationLabel(branchName: string, generation: string): string {
  const prefixes = [branchName, branchName.replace(/\s*\(.*\)\s*$/, '')];
  for (const prefix of prefixes) {
    if (generation.toLowerCase().startsWith(prefix.toLowerCase())) {
      const rest = generation.slice(prefix.length).replace(/^[\s-]+|[\s-]+$/g, '');
      if (rest) return rest;
    }
  }
  return generation;
}
