import Papa from 'papaparse';

export const parseAndValidateCsv = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        const processedRows = rows.map((row, index) => {
          const errors = [];
          
          // Helper to check if a field is empty
          const isEmpty = (val) => !val || val.trim() === '';

          // Validate required fields
          const requiredFields = ['name', 'email', 'dob', 'department', 'batch'];
          requiredFields.forEach((field) => {
            if (isEmpty(row[field])) {
              errors.push(`Missing ${field}`);
            }
          });

          // Validate email format if it exists
          if (!isEmpty(row.email)) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(row.email.trim())) {
              errors.push('Invalid email format');
            }
          }

          return {
            originalIndex: index + 2, // Excel row number (1 for header + 1 for 0-index)
            data: row,
            isValid: errors.length === 0,
            errors,
          };
        });

        resolve(processedRows);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};
