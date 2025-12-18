import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorHandler = (res: Response, err: any, scope: string) => {
  console.error(scope, err);

  const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
  const response = err.response || { message: 'Unknown error', details: err.message ?? err };

  res.status(status).json(response);
};
