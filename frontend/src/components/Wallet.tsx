import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { walletService, Transaction } from '../services/api';

const Wallet: React.FC = () => {
  const [wallet, setWallet] = useState<{ balance: string } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [depositLoading, setDepositLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loadWallet();
    loadTransactions();
  }, []);

  const loadWallet = async () => {
    try {
      const walletData = await walletService.getWallet();
      setWallet(walletData);
      
      // Automatyczne zasilenie 20 zł przy pierwszym użyciu (jeśli saldo = 0)
      if (parseFloat(walletData.balance) === 0) {
        try {
          const updatedWallet = await walletService.deposit(20);
          setWallet(updatedWallet);
          enqueueSnackbar('Dodano 20 zł do portfela (testowe środki)', { variant: 'info' });
          loadTransactions(); // Odśwież historię
        } catch (depositError: any) {
          console.error('Error auto-depositing:', depositError);
          // Nie pokazujemy błędu, bo to tylko pomocnicza funkcja
        }
      }
    } catch (error: any) {
      console.error('Error loading wallet:', error);
      enqueueSnackbar('Błąd podczas pobierania portfela', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (type?: string) => {
    try {
      const transactionsData = await walletService.getTransactions(type);
      setTransactions(transactionsData);
    } catch (error: any) {
      console.error('Error loading transactions:', error);
      enqueueSnackbar('Błąd podczas pobierania historii transakcji', { variant: 'error' });
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      enqueueSnackbar('Podaj prawidłową kwotę', { variant: 'error' });
      return;
    }

    setDepositLoading(true);
    try {
      const updatedWallet = await walletService.deposit(amount);
      setWallet(updatedWallet);
      setDepositDialogOpen(false);
      setDepositAmount('');
      enqueueSnackbar(`Wpłacono ${amount} zł do portfela (symulacja BLIK)`, { variant: 'success' });
      loadTransactions(); // Odśwież historię
    } catch (error: any) {
      console.error('Error depositing:', error);
      enqueueSnackbar(
        error.response?.data?.detail || 'Błąd podczas wpłaty',
        { variant: 'error' }
      );
    } finally {
      setDepositLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    const type = newValue === 0 ? undefined : ['deposit', 'payment', 'refund', 'driver_payment', 'withdrawal'][newValue - 1];
    loadTransactions(type);
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'driver_payment':
      case 'refund':
        return 'success';
      case 'payment':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Portfel
      </Typography>

      {/* Saldo */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Saldo portfela
              </Typography>
              <Typography variant="h3" color="primary">
                {wallet?.balance || '0.00'} zł
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setDepositDialogOpen(true)}
              size="large"
            >
              Zasil portfel (BLIK)
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Historia transakcji */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Historia transakcji
          </Typography>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="Wszystkie" />
            <Tab label="Wpłaty" />
            <Tab label="Płatności" />
            <Tab label="Zwroty" />
            <Tab label="Wypłaty" />
          </Tabs>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Typ</TableCell>
                  <TableCell>Kwota</TableCell>
                  <TableCell>Opis</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="textSecondary">
                        Brak transakcji
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.created_at)}</TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.transaction_type_display}
                          color={getTransactionColor(transaction.transaction_type) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color={
                            transaction.transaction_type === 'payment' ? 'error' : 'success.main'
                          }
                          fontWeight="bold"
                        >
                          {transaction.transaction_type === 'payment' ? '-' : '+'}
                          {parseFloat(transaction.amount).toFixed(2)} zł
                        </Typography>
                      </TableCell>
                      <TableCell>{transaction.description || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog wpłaty */}
      <Dialog open={depositDialogOpen} onClose={() => setDepositDialogOpen(false)}>
        <DialogTitle>Zasil portfel przez BLIK</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            To jest symulacja płatności. W rzeczywistości nie zostanie pobrana żadna kwota.
          </Alert>
          <TextField
            autoFocus
            margin="dense"
            label="Kwota (zł)"
            type="number"
            fullWidth
            variant="outlined"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepositDialogOpen(false)}>Anuluj</Button>
          <Button
            onClick={handleDeposit}
            variant="contained"
            disabled={depositLoading}
          >
            {depositLoading ? <CircularProgress size={24} /> : 'Wpłać'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Wallet;

