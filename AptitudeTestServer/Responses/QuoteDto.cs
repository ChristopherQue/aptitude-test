namespace AptitudeTestServer.Responses;

public record QuoteDto(int Id, string Name, decimal? Premium, decimal? Rate, decimal Tiv, string State, int StateId);

public record CreateQuote(string Name, decimal Tiv, int StateId);

public record UpdateQuote(string Name, decimal Tiv, int StateId);