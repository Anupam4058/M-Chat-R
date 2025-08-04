#!/usr/bin/env node

/**
 * Script to apply answer restoration pattern to all Question files
 * This updates the Redux selector and adds restoration useEffect
 */

const fs = require('fs');
const path = require('path');

const questionsDir = './src/pages';

// List of question files to update
const questionFiles = [];
for (let i = 11; i <= 20; i++) {
  questionFiles.push(`Question${i}.tsx`);
}

function updateQuestionFile(filePath, questionNumber) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the old selector pattern with new one
    const oldPattern = /const childInfo = useSelector\(\(state: RootState\) => \(state\.answers as any\)\.childInfo\);\s*const childName = childInfo\?\.childName \|\| "your child";/;
    const newPattern = `// Get child info and question results from Redux store
  const childInfo = useSelector((state: RootState) => (state as any).childInfo);
  const questionResults = useSelector((state: RootState) => (state as any).questionResults);
  const childName = childInfo?.childName || "your child";

  // Find existing result for this question
  const existingResult = questionResults?.find((result: any) => result.questionId === ${questionNumber});`;
    
    if (oldPattern.test(content)) {
      content = content.replace(oldPattern, newPattern);
      
      // Add restoration useEffect after subQuestions or similar arrays
      const subQuestionsPattern = /const (subQuestions|zeroQuestions|oneQuestions|zeroExampleQuestions|oneExampleQuestions) = \[[^\]]*\];/;
      const match = content.match(subQuestionsPattern);
      
      if (match) {
        const restoreEffect = `

  // Effect to restore state from existing result
  useEffect(() => {
    if (existingResult?.completed) {
      // Restore main answer
      setMainAnswer(existingResult.mainAnswer);
      
      // Restore sub-answers
      const savedSubAnswers = existingResult.subAnswers || [];
      // TODO: Customize based on specific question structure
      
      // Restore the result score
      const finalScore = existingResult.result === "pass" ? 0 : 1;
      setScore(finalScore);
    }
  }, [existingResult]);`;
        
        content = content.replace(match[0], match[0] + restoreEffect);
      }
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${path.basename(filePath)}`);
    } else {
      console.log(`Pattern not found in ${path.basename(filePath)}`);
    }
    
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

// Update each question file
questionFiles.forEach(fileName => {
  const filePath = path.join(questionsDir, fileName);
  const questionNumber = parseInt(fileName.match(/\d+/)[0]);
  
  if (fs.existsSync(filePath)) {
    updateQuestionFile(filePath, questionNumber);
  } else {
    console.log(`File not found: ${fileName}`);
  }
});

console.log('Bulk update completed!');
