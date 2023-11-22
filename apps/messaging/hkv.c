void main()
{
    int M = 128;
    int N = 128;
    int m = 32;

    for (int p = 0; p < M / m; p++)
    {
        for (int q = 0; q < N / m; q++)
        {
            for (int i = p * m; i < (p + 1) * m; i++)
            {
                for (int j = q * m; j < (q + 1) * m; j++)
                {
                    transposed[j][i] = original[i][j];
                }
            }
        }
    }
}
